
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPP1() {
    const learners = await prisma.learner.findMany({
        where: { grade: 'PP1' },
        orderBy: { admissionNumber: 'asc' }
    });

    console.log(`Learners in PP1 (${learners.length}):`);
    for (const l of learners) {
        console.log(`  - [${l.admissionNumber}] ${l.firstName} ${l.lastName}`);
    }
}

listPP1()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
