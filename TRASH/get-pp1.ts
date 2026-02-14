import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const learners = await prisma.learner.findMany({
        where: { grade: 'PP1' },
        select: { firstName: true, lastName: true, admissionNumber: true, id: true }
    });

    console.log(JSON.stringify(learners, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
