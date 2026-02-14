import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Final standardization pass...');

    const tests = await prisma.summativeTest.findMany({
        where: { grade: Grade.PP1 }
    });

    for (const test of tests) {
        let newArea = test.learningArea;
        const lowTitle = test.title.toLowerCase();

        if (lowTitle.includes('reading') || lowTitle.includes('literacy')) {
            newArea = 'Literacy & Reading';
        } else if (lowTitle.includes('english language') || lowTitle.includes('language activities')) {
            newArea = 'Language Activities';
        } else if (lowTitle.includes('mathematical') || lowTitle.includes('mathematics')) {
            newArea = 'Mathematical Activities';
        } else if (lowTitle.includes('environmental')) {
            newArea = 'Environmental Activities';
        } else if (lowTitle.includes('creative') || lowTitle.includes('c/a')) {
            newArea = 'Creative Activities';
        } else if (lowTitle.includes('cre') || lowTitle.includes('religious') || lowTitle.includes('ire')) {
            newArea = 'Religious Education';
        }

        if (newArea !== test.learningArea) {
            console.log(`Fixing: "${test.learningArea}" -> "${newArea}" [${test.title}]`);

            // Check if there's already a test with this newArea
            let target = await prisma.summativeTest.findFirst({
                where: {
                    schoolId: test.schoolId,
                    grade: test.grade,
                    term: test.term,
                    academicYear: test.academicYear,
                    learningArea: newArea,
                    testType: test.testType
                }
            });

            if (!target) {
                await prisma.summativeTest.update({
                    where: { id: test.id },
                    data: { learningArea: newArea }
                });
                console.log(`   Updated area to ${newArea}`);
            } else {
                // Move results
                const results = await prisma.summativeResult.findMany({
                    where: { testId: test.id }
                });
                for (const res of results) {
                    await prisma.summativeResult.upsert({
                        where: { testId_learnerId: { testId: target.id, learnerId: res.learnerId } },
                        update: { marksObtained: res.marksObtained },
                        create: { ...res, id: undefined, testId: target.id }
                    });
                }
                await prisma.summativeResult.deleteMany({ where: { testId: test.id } });
                await prisma.summativeTest.delete({ where: { id: test.id } });
                console.log(`   Merged into ${target.id}`);
            }
        }
    }
    console.log('Standardization pass complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
