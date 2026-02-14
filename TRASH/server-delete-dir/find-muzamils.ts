
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findMuzamils() {
    const learners = await prisma.learner.findMany({
        orderBy: { firstName: 'asc' }
    });

    const matches = learners.filter(l =>
        l.firstName.toUpperCase().includes('MUZAMIL') ||
        l.lastName.toUpperCase().includes('MUZAMIL')
    );

    console.log(`Found ${matches.length} Muzamils:`);
    for (const m of matches) {
        console.log(`  - ${m.firstName} ${m.lastName} (${m.admissionNumber}) [Grade: ${m.grade}, ID: ${m.id}]`);
    }
}

findMuzamils()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
