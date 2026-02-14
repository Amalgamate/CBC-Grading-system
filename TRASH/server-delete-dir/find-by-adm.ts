
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findByAdm() {
    const adms = ['ADM-PP1-035', '1309'];
    console.log(`Searching for admissions: ${adms.join(', ')}`);

    const matches = await prisma.learner.findMany({
        where: {
            admissionNumber: { in: adms }
        }
    });

    for (const m of matches) {
        console.log(`  - ${m.firstName} | ${m.lastName} | (${m.admissionNumber}) [ID: ${m.id}]`);
    }
}

findByAdm()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
