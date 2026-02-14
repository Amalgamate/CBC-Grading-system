import prisma from './src/config/database';

async function checkTeachers() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: 'TEACHER',
                archived: false
            },
            select: {
                firstName: true,
                lastName: true,
                staffId: true,
                email: true,
                schoolId: true
            }
        });

        console.log(`--- Teacher Count: ${teachers.length} ---`);
        if (teachers.length > 0) {
            console.log('List of Teachers:');
            teachers.forEach((t, i) => {
                console.log(`${i + 1}. ${t.firstName} ${t.lastName} (${t.staffId || 'No Staff ID'}) - SID: ${t.schoolId}`);
            });
        }

        // Also check schools
        const schools = await prisma.school.findMany({
            select: { id: true, name: true }
        });
        console.log('\n--- Schools in System ---');
        schools.forEach(s => console.log(`${s.name}: ${s.id}`));

    } catch (error: any) {
        console.error('Error checking teachers:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTeachers();
