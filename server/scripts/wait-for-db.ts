import { PrismaClient } from '@prisma/client';

async function waitForDb() {
    const prisma = new PrismaClient();
    const maxRetries = 5;
    const retryDelay = 5000; // 5 seconds

    console.log('⏳ Checking database connection...');

    for (let i = 1; i <= maxRetries; i++) {
        try {
            await prisma.$connect();
            console.log('✅ Database is awake and reachable!');
            await prisma.$disconnect();
            process.exit(0);
        } catch (error) {
            console.log(`⚠️ Database not ready (Attempt ${i}/${maxRetries}). Retrying in 5s...`);
            if (i === maxRetries) {
                console.error('❌ Could not connect to database after multiple attempts.');
                console.error(error);
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

waitForDb();
