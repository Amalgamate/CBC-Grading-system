const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTests() {
    console.log('🧹 Cleaning out Summative Tests and Results...');

    try {
        // 1. Delete Summative Result History
        const historyCount = await prisma.summativeResultHistory.deleteMany({});
        console.log(`- Deleted ${historyCount.count} Result History records`);

        // 2. Delete Summative Results
        const resultsCount = await prisma.summativeResult.deleteMany({});
        console.log(`- Deleted ${resultsCount.count} Summative Results`);

        // 3. Delete Summative Tests
        const testsCount = await prisma.summativeTest.deleteMany({});
        console.log(`- Deleted ${testsCount.count} Summative Tests`);

        console.log('✅ Summative Tests cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanTests();
