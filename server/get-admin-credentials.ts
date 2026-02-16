import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PROD_DATABASE_URL,
        },
    },
});

async function main() {
    try {
        // Get ZAWADI JUNIOR ACADEMY school
        const school = await prisma.school.findUnique({
            where: { name: 'ZAWADI JUNIOR ACADEMY' }
        });

        if (!school) {
            console.log('❌ School not found');
            return;
        }

        console.log('\n' + '═'.repeat(100));
        console.log(`🔐 ADMIN CREDENTIALS FOR: ${school.name}`);
        console.log('═'.repeat(100) + '\n');

        // Find admin users
        const admins = await prisma.user.findMany({
            where: {
                schoolId: school.id,
                role: 'ADMIN'
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true
            }
        });

        if (admins.length === 0) {
            console.log('❌ No admin users found\n');
            
            // Show all users instead
            const allUsers = await prisma.user.findMany({
                where: { schoolId: school.id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    status: true
                }
            });

            console.log(`📋 ALL USERS (${allUsers.length}):\n`);
            allUsers.forEach((user, idx) => {
                console.log(`${String(idx + 1).padStart(2, '0')}. ${user.firstName} ${user.lastName}`);
                console.log(`    Email: ${user.email}`);
                console.log(`    Role: ${user.role}`);
                console.log(`    Status: ${user.status}\n`);
            });
        } else {
            console.log(`✅ ADMIN USERS (${admins.length}):\n`);
            admins.forEach((admin, idx) => {
                console.log(`${String(idx + 1).padStart(2, '0')}. ${admin.firstName} ${admin.lastName}`);
                console.log(`    Email: ${admin.email}`);
                console.log(`    Role: ${admin.role}`);
                console.log(`    Status: ${admin.status}`);
                console.log(`    Created: ${new Date(admin.createdAt).toLocaleString()}\n`);
            });
        }

        console.log('═'.repeat(100) + '\n');
        console.log('⚠️  NOTE: Passwords are hashed. To login, use the email shown above.');
        console.log('    You may need to use "Forgot Password" or check with the system administrator.\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
