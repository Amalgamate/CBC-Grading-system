
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function manageMaryAcademy() {
    try {
        // 1. Find the schools
        const validSchool = await prisma.school.findUnique({
            where: { subdomain: 'mary' },
            include: { users: { where: { role: 'ADMIN' } } }
        });

        const duplicateSchools = await prisma.school.findMany({
            where: {
                name: { contains: 'mary', mode: 'insensitive' },
                subdomain: null
            }
        });

        // 2. Delete duplicate schools
        console.log('------------------------------------------------');
        if (duplicateSchools.length > 0) {
            console.log(`Found ${duplicateSchools.length} duplicate school(s) to delete.`);
            for (const school of duplicateSchools) {
                await prisma.school.delete({ where: { id: school.id } });
                console.log(`❌ Deleted school: ${school.name} (ID: ${school.id})`);
            }
        } else {
            console.log('No duplicate schools found.');
        }

        // 3. Reset password for valid school admin
        if (validSchool) {
            const admin = validSchool.users[0];
            if (admin) {
                const newPassword = 'ChangeMe123!';
                const hashedPassword = await bcrypt.hash(newPassword, 12);

                await prisma.user.update({
                    where: { id: admin.id },
                    data: { password: hashedPassword }
                });

                console.log('------------------------------------------------');
                console.log('✅ Credentials for Mary Academy (with domain):');
                console.log(`School Name: ${validSchool.name}`);
                console.log(`Subdomain:   ${validSchool.subdomain}`);
                console.log(`Login URL:   http://mary.localhost:3000/login (Local)`);
                console.log(`             http://${validSchool.subdomain}.elimcrown.co.ke/login (Prod)`);
                console.log(`Email:       ${admin.email}`);
                console.log(`Password:    ${newPassword}`);
                console.log('------------------------------------------------');
            } else {
                console.error('❌ No admin user found for Mary Academy (mary).');
            }
        } else {
            console.error('❌ Mary Academy with subdomain "mary" not found.');
        }

    } catch (error) {
        console.error('Error managing Mary Academy:', error);
    } finally {
        await prisma.$disconnect();
    }
}

manageMaryAcademy();
