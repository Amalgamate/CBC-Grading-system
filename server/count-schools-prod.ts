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
        const schools = await prisma.school.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        console.log('\n' + '═'.repeat(100));
        console.log(`📚 SCHOOLS IN PRODUCTION DATABASE: ${schools.length}`);
        console.log('═'.repeat(100) + '\n');

        schools.forEach((school, idx) => {
            const createdDate = new Date(school.createdAt).toLocaleDateString();
            console.log(`${String(idx + 1).padStart(2, '0')}. ${school.name.padEnd(40)} | Created: ${createdDate}`);
        });

        console.log('\n' + '═'.repeat(100) + '\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
