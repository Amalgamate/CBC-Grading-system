
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAll() {
    try {
        const schools = await prisma.school.findMany({
            select: { name: true, email: true }
        });
        console.log('Schools:', schools);
        const users = await prisma.user.findMany({
            select: { email: true, role: true }
        });
        console.log('Users:', users);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
listAll();
