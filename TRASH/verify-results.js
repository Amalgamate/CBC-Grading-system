const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const results = await prisma.summativeResult.count({
        where: {
            test: {
                grade: 'PP1',
                learningArea: 'Creative Activities'
            }
        }
    });
    console.log(`PP1 Creative Activities results: ${results}`);

    const areas = await prisma.summativeResult.findMany({
        where: { learner: { grade: 'PP1' } },
        include: { test: true },
        take: 100
    });
    const areaSet = new Set(areas.map(a => a.test.learningArea));
    console.log('Unique PP1 Areas with results:', Array.from(areaSet));
}
main().catch(console.error).finally(() => prisma.$disconnect());
