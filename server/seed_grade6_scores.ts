import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const schoolId = '16f9ea3f-1bd2-406c-bd95-a588ded33a0d';
const branchId = '68ce5409-0fa8-4abe-a966-8739f624526d';
const recorderId = 'd79a64d1-5c8c-4d54-8794-c4cb6c865b9f'; // Super Admin
const academicYear = 2026;
const term = 'TERM_1';
const grade = 'GRADE_6';

const subjects = [
    { name: 'MATHEMATICS', key: 'MATH' },
    { name: 'ENGLISH', key: 'ENG' },
    { name: 'KISWAHILI', key: 'KIS' },
    { name: 'SCIENCE AND TECHNOLOGY', key: 'SCI' },
    { name: 'SOCIAL STUDIES', key: 'SS' },
    { name: 'CREATIVE ARTS', key: 'CA' },
    { name: 'IRE', key: 'IRE' },
    { name: 'AGRICULTURE', key: 'AGRI' }
];

const studentScores = [
    { "imageName": "ZAMZAM HASSAN", "dbName": "ZAMZAM HASSAN", "scores": { "MATH": 67, "ENG": 74, "KIS": 64, "SCI": 84, "SS": 87, "CA": 72, "IRE": 93, "AGRI": 92 } },
    { "imageName": "AMINA RAMADHAN", "dbName": "AMINA RAMADHAN NGUKU", "scores": { "MATH": 87, "ENG": 84, "KIS": 62, "SCI": 68, "SS": 67, "CA": 68, "IRE": 100, "AGRI": 92 } },
    { "imageName": "SHUEB ALI", "dbName": "SHUIB EDIN", "scores": { "MATH": 77, "ENG": 64, "KIS": 72, "SCI": 76, "SS": 87, "CA": 64, "IRE": 87, "AGRI": 100 } },
    { "imageName": "KHADIJA IQBAL", "dbName": "KHADIJA IQBAL", "scores": { "MATH": 86, "ENG": 66, "KIS": 70, "SCI": 76, "SS": 70, "CA": 64, "IRE": 93, "AGRI": 100 } },
    { "imageName": "MOHAMED IBRAHIM", "dbName": "MOHAMMED IBRAHIM SHUNU", "scores": { "MATH": 67, "ENG": 58, "KIS": 68, "SCI": 76, "SS": 87, "CA": 68, "IRE": 87, "AGRI": 100 } },
    { "imageName": "YAHYA ISACK", "dbName": "YAHYAH ISSACK MOHAMED", "scores": { "MATH": 70, "ENG": 54, "KIS": 56, "SCI": 72, "SS": 87, "CA": 64, "IRE": 87, "AGRI": 100 } },
    { "imageName": "IBRAHIM KALLA", "dbName": "IBRAHIM KALLA IBRAHIM", "scores": { "MATH": 67, "ENG": 50, "KIS": 60, "SCI": 76, "SS": 83, "CA": 68, "IRE": 93, "AGRI": 92 } },
    { "imageName": "AISHA IBRAHIM", "dbName": "AISHA IBRAHIM ABDINOOR", "scores": { "MATH": 80, "ENG": 64, "KIS": 58, "SCI": 64, "SS": 70, "CA": 60, "IRE": 100, "AGRI": 92 } },
    { "imageName": "AISHA HUSSEIN", "dbName": "AISHA HUSSEIN SALESA", "scores": { "MATH": 57, "ENG": 60, "KIS": 54, "SCI": 80, "SS": 77, "CA": 64, "IRE": 100, "AGRI": 92 } },
    { "imageName": "LADHAN ABDI", "dbName": "LADHAN ABDI KULLOW", "scores": { "MATH": 53, "ENG": 66, "KIS": 66, "SCI": 72, "SS": 73, "CA": 72, "IRE": 80, "AGRI": 100 } },
    { "imageName": "ABUBAKAR SIRAJ", "dbName": "ABUBAKAR SIRAJ", "scores": { "MATH": 63, "ENG": 50, "KIS": 58, "SCI": 76, "SS": 87, "CA": 68, "IRE": 87, "AGRI": 88 } },
    { "imageName": "MAHIR ABDULLAHI", "dbName": "MAHIR ABDULLAHI", "scores": { "MATH": 70, "ENG": 52, "KIS": 68, "SCI": 64, "SS": 80, "CA": 68, "IRE": 67, "AGRI": 100 } },
    { "imageName": "HAMDI MOHAMED", "dbName": "HAMDI MOHAMUD", "scores": { "MATH": 67, "ENG": 56, "KIS": 54, "SCI": 72, "SS": 83, "CA": 76, "IRE": 67, "AGRI": 92 } },
    { "imageName": "ABDIWAHID MUHAMUD", "dbName": "ABDIWAHID MUHAMUD", "scores": { "MATH": 47, "ENG": 46, "KIS": 55, "SCI": 80, "SS": 87, "CA": 68, "IRE": 93, "AGRI": 84 } },
    { "imageName": "FARHAN ALI", "dbName": "ALI JEILAN ALI", "scores": { "MATH": 70, "ENG": 54, "KIS": 56, "SCI": 72, "SS": 83, "CA": 68, "IRE": 67, "AGRI": 88 } },
    { "imageName": "RAHMA ABDI", "dbName": "RAHMA ABDI MOHAMED", "scores": { "MATH": 50, "ENG": 62, "KIS": 58, "SCI": 64, "SS": 83, "CA": 52, "IRE": 80, "AGRI": 96 } },
    { "imageName": "ABDIRAHMAN IBRAHIM", "dbName": "ABDIRAHMAN IBRAHIM SHUNU", "scores": { "MATH": 80, "ENG": 48, "KIS": 66, "SCI": 76, "SS": 87, "CA": 64, "IRE": 87, "AGRI": 36 } },
    { "imageName": "DAHABO HUSSEIN", "dbName": "DAHABO HUSSEIN DENGE", "scores": { "MATH": 40, "ENG": 52, "KIS": 52, "SCI": 68, "SS": 80, "CA": 68, "IRE": 80, "AGRI": 84 } },
    { "imageName": "MUSARDH ALI", "dbName": "MUSARHAD ALI ABDOW", "scores": { "MATH": 57, "ENG": 48, "KIS": 52, "SCI": 64, "SS": 87, "CA": 68, "IRE": 67, "AGRI": 80 } },
    { "imageName": "SIHAM ABDIRIZACK", "dbName": "SIHAM ABDIRIZACK", "scores": { "MATH": 60, "ENG": 32, "KIS": 52, "SCI": 52, "SS": 87, "CA": 64, "IRE": 87, "AGRI": 84 } },
    { "imageName": "MOHAMED HUSSEIN", "dbName": "MOHAMED HUSSEIN MOHAMED", "scores": { "MATH": 53, "ENG": 56, "KIS": 48, "SCI": 68, "SS": 80, "CA": 44, "IRE": 80, "AGRI": 88 } },
    { "imageName": "JAMAL ABDIKADIR", "dbName": "JAMAL ABDIKADIR ABDI", "scores": { "MATH": 73, "ENG": 54, "KIS": 63, "SCI": 72, "SS": 80, "CA": 68, "IRE": 80, "AGRI": 72 } },
    { "imageName": "RAYAN SHUKRI", "dbName": "RAYAN SHUKRI MOHAMED", "scores": { "MATH": 83, "ENG": 52, "KIS": 54, "SCI": 44, "SS": 67, "CA": 52, "IRE": 80, "AGRI": 52 } },
    { "imageName": "ABDIRIZACK IBRAHIM", "dbName": "ABDIRIZACK IBRAHIM", "scores": { "MATH": 53, "ENG": 32, "KIS": 42, "SCI": 60, "SS": 80, "CA": 44, "IRE": 73, "AGRI": 92 } },
    { "imageName": "ZAKIA ALINOOR", "dbName": "ZAKIA ALINOOR MAALIM", "scores": { "MATH": 43, "ENG": 58, "KIS": 50, "SCI": 44, "SS": 43, "CA": 40, "IRE": 60, "AGRI": 56 } },
    { "imageName": "ROSE MAKENA", "dbName": "ROSE MAKENA KIMATHI", "scores": { "MATH": 47, "ENG": 32, "KIS": 40, "SCI": 44, "SS": 60, "CA": null, "IRE": 53, "AGRI": 76 } },
    { "imageName": "HAMIDA ABDI", "dbName": "HAMIDA ABDI IBRAHIM", "scores": { "MATH": 33, "ENG": 44, "KIS": 42, "SCI": 52, "SS": 43, "CA": 36, "IRE": 33, "AGRI": 56 } }
];

function getGrade(percentage: number) {
    if (percentage >= 80) return 'A';
    if (percentage >= 65) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'E';
}

async function main() {
    console.log('Starting Grade 6 score seeding...');

    // 1. Fetch Grade 6 students
    const learners = await prisma.learner.findMany({
        where: { schoolId, grade },
        select: { id: true, firstName: true, middleName: true, lastName: true }
    });

    const getLearnerId = (dbName: string) => {
        const found = learners.find(l => {
            const fullName = [l.firstName, l.middleName, l.lastName].filter(Boolean).join(' ').toUpperCase();
            return fullName.includes(dbName.toUpperCase()) || dbName.toUpperCase().includes(fullName);
        });
        return found?.id;
    };

    for (const subject of subjects) {
        console.log(`Processing subject: ${subject.name}`);

        // 2. Create or find SummativeTest
        let test = await prisma.summativeTest.findFirst({
            where: {
                schoolId,
                grade: grade as any,
                learningArea: subject.name,
                term: term as any,
                academicYear
            }
        });

        if (!test) {
            test = await prisma.summativeTest.create({
                data: {
                    title: `Opener Exam - ${subject.name}`,
                    learningArea: subject.name,
                    term: term as any,
                    academicYear,
                    grade: grade as any,
                    testDate: new Date('2026-01-10'),
                    totalMarks: 100,
                    passMarks: 40,
                    createdBy: recorderId,
                    published: true,
                    status: 'PUBLISHED' as any,
                    schoolId,
                    branchId
                }
            });
        }

        // 3. Create results
        for (const record of studentScores) {
            const learnerId = getLearnerId(record.dbName);
            if (!learnerId) {
                console.warn(`Could not find learner in DB for: ${record.dbName}`);
                continue;
            }

            const score = record.scores[subject.key];
            if (score === null || score === undefined) continue;

            const percentage = (score / 100) * 100;
            const gradeLabel = getGrade(percentage);
            const status = percentage >= 40 ? 'PASS' : 'FAIL';

            // @ts-ignore
            await prisma.summativeResult.upsert({
                where: {
                    testId_learnerId: {
                        testId: test.id,
                        learnerId
                    }
                },
                update: {
                    marksObtained: score,
                    percentage,
                    grade: gradeLabel,
                    status,
                    updatedAt: new Date()
                },
                create: {
                    testId: test.id,
                    learnerId,
                    marksObtained: score,
                    percentage,
                    grade: gradeLabel,
                    status,
                    recordedBy: recorderId,
                    schoolId,
                    branchId
                }
            });
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
