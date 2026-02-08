const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({
            take: 10,
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                schoolId: true
            }
        });
        console.log('--- Users ---');
        console.log(JSON.stringify(users, null, 2));

        const count = await prisma.user.count();
        console.log('Total user count:', count);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
