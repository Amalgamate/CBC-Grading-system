const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
    console.log('🧹 Starting database cleanup for Learning Areas, Performance Scales, and Tests...');

    try {
        // 1. Delete Summative Result History
        console.log('Deleting Summative Result History...');
        await prisma.summativeResultHistory.deleteMany({});

        // 2. Delete Summative Results
        console.log('Deleting Summative Results...');
        await prisma.summativeResult.deleteMany({});

        // 3. Delete Summative Tests
        console.log('Deleting Summative Tests...');
        await prisma.summativeTest.deleteMany({});

        // 4. Delete Grading Ranges
        console.log('Deleting Grading Ranges...');
        await prisma.gradingRange.deleteMany({});

        // 5. Delete Grading Systems
        console.log('Deleting Grading Systems...');
        await prisma.gradingSystem.deleteMany({});

        // 6. Delete Scale Groups
        console.log('Deleting Scale Groups...');
        await prisma.scaleGroup.deleteMany({});

        // 7. Delete Learning Areas
        console.log('Deleting Learning Areas...');
        await prisma.learningArea.deleteMany({});

        console.log('✅ Database cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanData();
