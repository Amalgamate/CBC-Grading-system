
import { PrismaClient, Grade } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const DATA_DIR = path.join(__dirname, '..', 'data');

async function checkDuplicates() {
    console.log('🔍 Checking for potential duplicates (Name Matches)...');

    const school = await prisma.school.findFirst({
        where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
        console.error('❌ School not found.');
        return;
    }

    const filesToProcess = [
        { filename: 'PP1_student_grades.xlsx', grade: Grade.PP1 },
        { filename: 'PP2_student_grades-PP2.xlsx', grade: Grade.PP2 }
    ];

    for (const fileInfo of filesToProcess) {
        const filePath = path.join(DATA_DIR, fileInfo.filename);
        console.log(`Checking file: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File NOT found: ${filePath}`);
            continue;
        }

        console.log(`\n📂 Analyzing ${fileInfo.filename} (${fileInfo.grade})`);

        // 1. Get all DB Learners for this grade
        const dbLearners = await prisma.learner.findMany({
            where: {
                schoolId: school.id,
                grade: fileInfo.grade
            }
        });

        console.log(`   📚 DB Records: ${dbLearners.length}`);

        // 2. Read Excel
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        // Find Header
        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i].includes('No.') && rows[i].includes('First Name')) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            // Fallback to row 4 (index 4) if searched failed but structure known
            if (rows[4] && rows[4].includes('No.')) headerRowIndex = 4;
            else continue;
        }

        const dataStartIndex = headerRowIndex + 1;
        let matchCount = 0;
        let potentialDupes = 0;
        let newAdditions = 0;

        for (let i = dataStartIndex; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            const no = parseInt(row[0]);
            if (isNaN(no)) continue;

            const firstName = (row[1]?.toString() || '').trim();
            const lastName = (row[2]?.toString() || '').trim();
            if (!firstName || !lastName) continue;
            const fullNameExcel = `${firstName} ${lastName}`.toLowerCase();

            // My Seeded ID
            const mySeededAdm = `ADM-${fileInfo.grade}-${no.toString().padStart(3, '0')}`;

            // Find matches in DB
            const matches = dbLearners.filter(l =>
            (l.firstName.trim().toLowerCase() === firstName.toLowerCase() &&
                l.lastName.trim().toLowerCase() === lastName.toLowerCase())
            );

            if (matches.length === 0) {
                // New student I added? Wait, if I added it, it should be in DB.
                console.log(`   ❓ No match found in DB for: ${firstName} ${lastName}`);
            } else {
                // Check if ANY match has a different ADM number than what I generated
                const duplicates = matches.filter(m => m.admissionNumber !== mySeededAdm);

                if (duplicates.length > 0) {
                    console.log(`   🔸 Potential DUPLICATE: "${firstName} ${lastName}"`);
                    console.log(`       - Excel ID: ${mySeededAdm}`);
                    duplicates.forEach(d => console.log(`       - DB Match: ${d.admissionNumber} (${d.firstName} ${d.lastName})`));
                    potentialDupes++;
                } else {
                    // Only matches my seeded ID
                    newAdditions++;
                }
            }
        }
    }
}

checkDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
