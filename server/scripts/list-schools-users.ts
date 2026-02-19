import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking database content...');

    const schoolCount = await prisma.school.count();
    console.log(`\n🏫 Schools found: ${schoolCount}`);

    if (schoolCount > 0) {
        const schools = await prisma.school.findMany({
            select: { id: true, name: true, subdomain: true }
        });
        console.table(schools);
    }

    const userCount = await prisma.user.count();
    console.log(`\nbusts Users found: ${userCount}`);

    if (userCount > 0) {
        const users = await prisma.user.findMany({
            take: 10,
            select: { id: true, email: true, firstName: true, lastName: true, role: true, schoolId: true }
        });
        console.table(users);
    } else {
        console.log('⚠️ No users found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
