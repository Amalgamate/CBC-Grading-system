const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tests = await prisma.summativeTest.findMany({
        where: { grade: 'PP1' },
        select: { learningArea: true, title: true }
    });
    const stats = {};
    tests.forEach(t => {
        const key = t.learningArea;
        if (!stats[key]) stats[key] = [];
        stats[key].push(t.title);
    });
    console.log(JSON.stringify(stats, null, 2));
    await prisma.$disconnect();
}

main();
