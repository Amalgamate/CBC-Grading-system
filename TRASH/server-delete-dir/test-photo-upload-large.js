
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLargeUpload() {
    console.log('Testing LARGE photo upload on live database...');

    try {
        const learner = await prisma.learner.findFirst();
        if (!learner) {
            console.log('No learner found to test with.');
            return;
        }
        console.log(`Testing with learner: ${learner.firstName} ${learner.lastName}`);

        // Generate a large string (~1MB)
        // base64 characters are 1 byte each in ASCII/UTF-8 usually.
        // 1MB = 1024 * 1024 bytes.
        const largeData = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 1024);

        const updated = await prisma.learner.update({
            where: { id: learner.id },
            data: {
                photoUrl: largeData
            }
        });

        console.log('✅ Large payload (1MB) updated successfully.');
        console.log('New photoUrl length:', updated.photoUrl.length);

    } catch (error) {
        console.error('❌ Error during large upload test:', error.message);
        if (error.code) console.error('Error Code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

testLargeUpload();
