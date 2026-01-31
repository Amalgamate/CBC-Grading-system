import prisma from './src/config/database';

async function debugUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                phone: true,
                status: true,
                schoolId: true
            }
        });
        console.log('--- Current Users in DB ---');
        console.table(users);
        console.log('---------------------------');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugUsers();
