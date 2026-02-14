
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpload() {
    console.log('Testing photo upload on live database...');

    try {
        // 1. Find a learner
        const learner = await prisma.learner.findFirst();
        if (!learner) {
            console.log('No learner found to test with.');
            return;
        }
        console.log(`Testing with learner: ${learner.firstName} ${learner.lastName} (${learner.id})`);

        // 2. Sample small base64 image (transparent 1x1 pixel)
        const testPhotoData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        // 3. Attempt update
        const updated = await prisma.learner.update({
            where: { id: learner.id },
            data: {
                photoUrl: testPhotoData
            }
        });

        console.log('✅ Learner photoUrl updated successfully.');
        console.log('New photoUrl starts with:', updated.photoUrl.substring(0, 50));

        // 4. Test User profilePicture
        const user = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (user) {
            console.log(`Testing with user: ${user.email} (${user.id})`);
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    profilePicture: testPhotoData
                }
            });
            console.log('✅ User profilePicture updated successfully.');
        }

    } catch (error) {
        console.error('❌ Error during upload test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testUpload();
