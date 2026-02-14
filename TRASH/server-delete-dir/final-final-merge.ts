
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalFinalMerge() {
    const pairs = [
        { from: '1272', to: 'ADM-PP2-007' }, // Mariam Sidi
        { from: '1327', to: 'ADM-PP2-022' }, // Mawadha
        { from: '1407', to: 'ADM-PP2-026' }, // Umayma
        { from: '1192', to: 'ADM-PP2-001' }, // Hafidh -> Abdihafidh
    ];

    for (const pair of pairs) {
        const f = await prisma.learner.findFirst({ where: { admissionNumber: pair.from } });
        const t = await prisma.learner.findFirst({ where: { admissionNumber: pair.to } });

        if (f && t) {
            console.log(`Merging ${f.admissionNumber} -> ${t.admissionNumber}`);
            await prisma.summativeResult.updateMany({ where: { learnerId: f.id }, data: { learnerId: t.id } });
            await prisma.learner.delete({ where: { id: f.id } });
        }
    }

    // Final check for Halima Shabaan
    const halima = await prisma.learner.findFirst({ where: { admissionNumber: '1390' } });
    if (halima) {
        console.log(`Halima Shabaan (1390) found in grade ${halima.grade}. Not merging as no clear ADM match found.`);
    }
}

finalFinalMerge()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
