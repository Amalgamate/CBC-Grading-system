
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateScores() {
    console.log('🔍 Checking scores for duplicates...');

    const muzamils = await prisma.learner.findMany({
        where: {
            firstName: { contains: 'MUZAMIL', mode: 'insensitive' }
        },
        include: {
            summativeResults: {
                include: { test: true }
            }
        }
    });

    for (const m of muzamils) {
        console.log(`\nLearner: ${m.firstName} ${m.lastName} (${m.admissionNumber}) [ID: ${m.id}]`);
        console.log(`Grade: ${m.grade}`);
        console.log(`Results Found: ${m.summativeResults.length}`);
        m.summativeResults.forEach(r => {
            console.log(`  - Test: ${r.test.title}, Year: ${r.test.academicYear}, Marks: ${r.marksObtained}`);
        });
    }
}

checkDuplicateScores()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
