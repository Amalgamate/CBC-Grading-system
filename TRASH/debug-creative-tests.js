const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const tests = await prisma.summativeTest.findMany({
            where: {
                grade: 'PP1',
                OR: [
                    { title: { contains: 'Creative', mode: 'insensitive' } },
                    { learningArea: { contains: 'Creative', mode: 'insensitive' } }
                ]
            }
        });

        console.log(`Found ${tests.length} Creative-related tests for PP1:`);
        for (const t of tests) {
            const resultCount = await prisma.summativeResult.count({
                where: { testId: t.id }
            });
            console.log(`ID: ${t.id} | Title: ${t.title} | Area: ${t.learningArea} | Results: ${resultCount}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
