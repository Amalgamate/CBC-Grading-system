
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyScores() {
    console.log('🔍 Verifying seeded scores...\n');

    const school = await prisma.school.findFirst({
        where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
        console.error('❌ School not found!');
        return;
    }

    const grades = ['PP1', 'PP2'];

    for (const grade of grades) {
        console.log(`\n--- Grade: ${grade} ---`);
        const tests = await prisma.summativeTest.findMany({
            where: {
                schoolId: school.id,
                grade: grade as any,
                testType: 'OPENER'
            },
            include: {
                _count: {
                    select: { results: true }
                }
            }
        });

        if (tests.length === 0) {
            console.log('   ⚠️ No Opener Tests found.');
            continue;
        }

        for (const test of tests) {
            console.log(`   📝 Test: ${test.title} (${test.learningArea}) [${test.id}] - Results: ${test._count.results}`);

            // Sample results
            const results = await prisma.summativeResult.findMany({
                where: { testId: test.id },
                take: 3,
                include: { learner: true }
            });

            results.forEach(r => {
                console.log(`      - ${r.learner.firstName} ${r.learner.lastName}: ${r.marksObtained} (${r.grade})`);
            });
        }
    }
}

verifyScores()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
