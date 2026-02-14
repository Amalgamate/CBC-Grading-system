
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLearner() {
    try {
        const learners = await prisma.learner.findMany({
            where: {
                OR: [
                    { firstName: { contains: 'Rico' } },
                    { lastName: { contains: 'Kariuki' } }
                ]
            }
        });

        console.log(`Found ${learners.length} learners matching "Rico" or "Kariuki"`);
        learners.forEach(l => {
            console.log(`- ID: ${l.id}, Name: ${l.firstName} ${l.lastName}, photoUrl: ${l.photoUrl ? l.photoUrl.substring(0, 50) + '...' : 'null'}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLearner();
