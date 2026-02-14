const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- ALL INDEXES ON LEARNERS ---');
        const indexes = await prisma.$queryRawUnsafe(`SELECT indexname FROM pg_indexes WHERE tablename = 'learners'`);
        console.log(JSON.stringify(indexes, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
