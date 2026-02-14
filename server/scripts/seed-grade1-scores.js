const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const EXCEL_PATH = 'c:/Amalgamate/Projects/EDucore/data/Grade1.xlsx';
    const school = await prisma.school.findFirst();

    if (!school) {
        console.error('No school found in the database.');
        return;
    }

    const schoolId = school.id;
    const academicYear = 2026;
    const term = 'TERM_1';
    const USER_ID = 'c710c457-81cb-48de-8d91-a67cc381a1b8';

    console.log(`Starting seeding for School: ${school.name} (${schoolId})`);

    // 1. Read Excel Data
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    // 2. Fetch Grade 1 Learners
    const dbLearners = await prisma.learner.findMany({
        where: { schoolId, grade: 'GRADE_1' }
    });

    console.log(`Found ${dbLearners.length} Grade 1 learners in database.`);

    // 3. Subject Mapping
    const subjectMap = {
        'Mathematics': 'Mathematical Activities',
        'English': 'English Language Activities',
        'Kiswahili': 'Kiswahili Language Activities',
        'Environmental Activities': 'Environmental Activities',
        'Creative Activities': 'Movement and Creative Activities'
    };

    // 4. Test Creation
    const tests = {};
    for (const [excelSub, dbSub] of Object.entries(subjectMap)) {
        let test = await prisma.summativeTest.findFirst({
            where: {
                schoolId,
                learningArea: dbSub,
                term,
                academicYear,
                testType: 'OPENER'
            }
        });

        if (!test) {
            console.log(`Creating test for ${dbSub}...`);
            test = await prisma.summativeTest.create({
                data: {
                    title: `Opener Exam - ${dbSub}`,
                    learningArea: dbSub,
                    testType: 'OPENER',
                    term,
                    academicYear,
                    grade: 'GRADE_1',
                    testDate: new Date('2026-01-10'),
                    totalMarks: 100,
                    passMarks: 50,
                    createdBy: USER_ID,
                    schoolId
                }
            });
        }
        tests[excelSub] = test;
    }

    // 5. Match and Seed
    const matchedIds = new Set();
    const mismatches = [];
    const seeded = [];

    for (const row of excelData) {
        const firstName = String(row['First Name']).trim();
        const lastName = String(row['Second Name']).trim();
        const fullNameExcel = `${firstName} ${lastName}`.toLowerCase();

        // Find match
        const match = dbLearners.find(l => {
            if (matchedIds.has(l.id)) return false;

            const dbFirst = (l.firstName || '').toLowerCase().trim();
            const dbLast = (l.lastName || '').toLowerCase().trim();
            const dbFull = `${dbFirst} ${dbLast}`;

            // 1. Exact match
            if (dbFull === fullNameExcel) return true;

            // 2. Specific Overrides
            if (firstName === 'Azmi' && (dbFirst === 'asmin' || dbFirst === 'azmi')) return true;
            if (firstName === 'Sabdio' && dbFirst === 'sabdio') return true;
            if (firstName === 'Hindiya' && dbFirst === 'hindia') return true;
            if (firstName === 'Sayhuna' && dbFirst === 'sayhuna') return true;
            if (firstName === 'Hanan' && dbFirst === 'anan') return true;
            if (firstName === 'Istisam' && dbFirst === 'iftisam') return true;
            if (firstName === 'Zakir' && dbFirst === 'zakir') return true;
            if (firstName === 'Prince' && dbFirst === 'prince') return true;
            if (firstName === 'Hanifa' && dbFirst === 'hanifa') return true;

            // 3. Tighter contains (word boundaries)
            const excelFirstLower = firstName.toLowerCase();
            const excelLastLower = lastName.toLowerCase();

            // Avoid matching "Abdi" to "Abdirahim"
            const isAbdiOnly = excelFirstLower === 'abdi' || excelLastLower === 'abdi';
            if (isAbdiOnly) {
                // If excel name is just "Abdi", match exactly or check if db name has "Abdi" as a separate word
                const dbWords = dbFull.split(' ');
                if (dbWords.includes('abdi')) return true;
            } else {
                if (dbFull.includes(excelFirstLower) && dbFull.includes(excelLastLower)) return true;
            }

            return false;
        });

        if (!match) {
            mismatches.push(`${firstName} ${lastName}`);
            continue;
        }

        matchedIds.add(match.id);

        // Update Learner Name
        await prisma.learner.update({
            where: { id: match.id },
            data: {
                firstName: firstName,
                lastName: lastName,
                middleName: null
            }
        });

        // Seed results
        for (const [excelSub, test] of Object.entries(tests)) {
            const score = parseInt(row[excelSub]);
            if (isNaN(score)) continue;

            const percentage = (score / test.totalMarks) * 100;
            let grade = 'E';
            if (percentage >= 90) grade = 'EE1';
            else if (percentage >= 75) grade = 'EE2';
            else if (percentage >= 58) grade = 'ME1';
            else if (percentage >= 41) grade = 'ME2';
            else if (percentage >= 31) grade = 'AE1';
            else if (percentage >= 21) grade = 'AE2';
            else if (percentage >= 11) grade = 'BE1';
            else grade = 'BE2';

            await prisma.summativeResult.upsert({
                where: {
                    testId_learnerId: {
                        testId: test.id,
                        learnerId: match.id
                    }
                },
                update: {
                    marksObtained: score,
                    percentage: percentage,
                    grade: grade,
                    status: score >= test.passMarks ? 'PASS' : 'FAIL'
                },
                create: {
                    testId: test.id,
                    learnerId: match.id,
                    marksObtained: score,
                    percentage: percentage,
                    grade: grade,
                    status: score >= test.passMarks ? 'PASS' : 'FAIL',
                    recordedBy: USER_ID,
                    schoolId
                }
            });
        }
        seeded.push(`${firstName} ${lastName}`);
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log(`Seeded: ${seeded.length}`);
    console.log(`Mismatches: ${mismatches.length}`);
    if (mismatches.length > 0) {
        console.log('Mismatched names (Excel):', mismatches);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
