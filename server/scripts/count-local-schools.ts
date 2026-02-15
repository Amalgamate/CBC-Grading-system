
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countSchools() {
    try {
        const count = await prisma.school.count();
        const schools = await prisma.school.findMany({
            select: { id: true, name: true, subdomain: true }
        });

        console.log(`\nTotal Schools: ${count}`);
        console.log('------------------------------------------------');
        schools.forEach(s => {
            console.log(`- ${s.name} (${s.subdomain || 'no-subdomain'})`);
        });
        console.log('------------------------------------------------\n');
    } catch (error) {
        console.error('Error counting schools:', error);
    } finally {
        await prisma.$disconnect();
    }
}

countSchools();
