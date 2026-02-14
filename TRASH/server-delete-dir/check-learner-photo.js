
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPhoto() {
    try {
        // Find the most recently updated learner
        const learner = await prisma.learner.findFirst({
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                updatedAt: true
            }
        });

        if (learner) {
            console.log('Most Recent Learner:', `${learner.firstName} ${learner.lastName}`);
            console.log('ID:', learner.id);
            console.log('Updated At:', learner.updatedAt);

            if (learner.photoUrl) {
                console.log('✅ Photo URL exists.');
                console.log('Length:', learner.photoUrl.length);
                console.log('Preview:', learner.photoUrl.substring(0, 50) + '...');
            } else {
                console.log('❌ Photo URL is NULL or empty.');
            }
        } else {
            console.log('No learners found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPhoto();
