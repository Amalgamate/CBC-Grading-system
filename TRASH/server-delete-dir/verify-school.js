
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchool() {
    try {
        const schoolId = '640861c4-e364-4a62-b5a9-20795411266d';

        console.log(`Checking for School ID: ${schoolId}`);
        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        if (school) {
            console.log('✅ School FOUND:', school.name);
        } else {
            console.log('❌ School NOT found in local DB.');
        }

        console.log('\nChecking admin user details:');
        const admin = await prisma.user.findFirst({
            where: { email: 'admin@local.test' },
            include: { school: true }
        });

        if (admin) {
            console.log(`User: ${admin.email}, SchoolID: ${admin.schoolId}`);
            if (admin.school) {
                console.log(`Linked School Name: ${admin.school.name}, Linked School ID: ${admin.school.id}`);
            } else {
                console.log('User has schoolId but no School record found?');
            }
        } else {
            console.log('User admin@local.test NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchool();
