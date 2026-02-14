import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true, schoolId: true }
    });
    console.log('ADMINS_START');
    console.log(JSON.stringify(admins, null, 2));
    console.log('ADMINS_END');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
