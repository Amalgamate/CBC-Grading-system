const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const tests = await prisma.summativeTest.findMany({
        where: { grade: 'PP1', title: { contains: 'Creative', mode: 'insensitive' } }
    });
    console.log(JSON.stringify(tests, null, 2));
    await prisma.$disconnect();
}
main();
