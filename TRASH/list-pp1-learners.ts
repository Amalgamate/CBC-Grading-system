import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const learners = await prisma.learner.findMany({
        where: { grade: 'PP1' },
        select: { id: true, firstName: true, lastName: true, admissionNumber: true }
    });

    console.log(`Found ${learners.length} PP1 learners:`);
    learners.forEach(l => {
        console.log(`${l.firstName} ${l.lastName} (ADM: ${l.admissionNumber}, ID: ${l.id})`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
