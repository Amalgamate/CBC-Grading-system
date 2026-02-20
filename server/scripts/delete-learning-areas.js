const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteLearningAreas() {
    console.log('🧹 Deleting all current Learning Areas...');
    try {
        const count = await prisma.learningArea.deleteMany({});
        console.log(`✅ Successfully deleted ${count.count} learning areas.`);
    } catch (error) {
        console.error('❌ Error deleting learning areas:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteLearningAreas();
