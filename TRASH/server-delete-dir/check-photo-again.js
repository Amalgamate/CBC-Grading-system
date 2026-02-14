
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPhoto() {
    try {
        const learner = await prisma.learner.findFirst({
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                photoUrl: true
            }
        });

        if (learner) {
            console.log(`Learner: ${learner.firstName} (${learner.id})`);
            console.log(`Photo URL Length: ${learner.photoUrl ? learner.photoUrl.length : 'NULL'}`);
            console.log(`Photo URL Preview: ${learner.photoUrl ? learner.photoUrl.substring(0, 30) + '...' : 'N/A'}`);
        } else {
            console.log('No learners found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkPhoto();
