
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countUsersInMaryAcademy() {
    try {
        // Find schools with names containing "Mary"
        const schools = await prisma.school.findMany({
            where: {
                name: {
                    contains: 'Mary',
                    mode: 'insensitive'
                }
            },
            select: { id: true, name: true, subdomain: true }
        });

        console.log(`\nFound ${schools.length} schools matching "Mary":`);
        console.log('------------------------------------------------');

        for (const school of schools) {
            const userCount = await prisma.user.count({
                where: { schoolId: school.id }
            });
            console.log(`School: ${school.name} (Subdomain: ${school.subdomain || 'N/A'})`);
            console.log(`- Total Users: ${userCount}`);

            // Breakdown by role
            const usersByRole = await prisma.user.groupBy({
                by: ['role'],
                where: { schoolId: school.id },
                _count: { role: true }
            });

            if (usersByRole.length > 0) {
                console.log('- Breakdown by Role:');
                usersByRole.forEach(roleGroup => {
                    console.log(`  - ${roleGroup.role}: ${roleGroup._count.role}`);
                });
            }
            console.log('------------------------------------------------');
        }

    } catch (error) {
        console.error('Error counting users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

countUsersInMaryAcademy();
