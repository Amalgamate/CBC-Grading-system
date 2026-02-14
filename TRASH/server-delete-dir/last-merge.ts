
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function lastMerge() {
    const from = '1381'; // aliya nassir abdirahman
    const to = 'ADM-PP1-029'; // Alya Nasrir

    const f = await prisma.learner.findFirst({ where: { admissionNumber: from } });
    const t = await prisma.learner.findFirst({ where: { admissionNumber: to } });

    if (f && t) {
        console.log(`Merging ${f.id} to ${t.id}`);
        await prisma.summativeResult.updateMany({ where: { learnerId: f.id }, data: { learnerId: t.id } });
        await prisma.learner.delete({ where: { id: f.id } });
    }

    // Check PP2
    const pp2 = await prisma.learner.findMany({ where: { grade: 'PP2' } });
    console.log(`PP2 count: ${pp2.length}`);
    pp2.filter(l => !l.admissionNumber.startsWith('ADM-')).forEach(l => {
        console.log(`  - Leftover in PP2: [${l.admissionNumber}] ${l.firstName} ${l.lastName}`);
    });
}

lastMerge()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
