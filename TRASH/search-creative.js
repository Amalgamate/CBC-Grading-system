const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- PP1 Tests ---');
        const pp1Tests = await prisma.summativeTest.findMany({
            where: { grade: 'PP1' },
            select: { id: true, title: true, learningArea: true, testType: true }
        });

        pp1Tests.forEach(t => {
            console.log(`Test ID: ${t.id} | Area: ${t.learningArea} | Title: ${t.title} | Type: ${t.testType}`);
        });

        console.log('\n--- Searching for any "Creative" results across all grades ---');
        const creativeResults = await prisma.summativeResult.findMany({
            where: {
                test: {
                    learningArea: { contains: 'Creative', mode: 'insensitive' }
                }
            },
            include: {
                learner: { select: { firstName: true, lastName: true, grade: true } },
                test: { select: { title: true, learningArea: true } }
            }
        });

        console.log(`Found ${creativeResults.length} creative results.`);
        creativeResults.slice(0, 5).forEach(r => {
            console.log(`- ${r.learner.firstName} (${r.learner.grade}): ${r.test.learningArea} [${r.test.title}]`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
