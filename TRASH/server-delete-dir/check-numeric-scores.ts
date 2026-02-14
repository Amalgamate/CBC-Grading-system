
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNumericScores() {
    console.log('🔍 Checking if scores are trapped in numeric admission records...');

    const learners = await prisma.learner.findMany({
        where: {
            grade: { in: ['PP1', 'PP2'] },
            NOT: {
                admissionNumber: { startsWith: 'ADM-' }
            }
        },
        include: {
            summativeResults: {
                include: { test: true }
            }
        }
    });

    console.log(`Found ${learners.length} numeric learners in PP1/PP2.`);

    let totalScores = 0;
    for (const l of learners) {
        if (l.summativeResults.length > 0) {
            console.log(`\n🚨 Learner with scores found: ${l.firstName} ${l.lastName} (${l.admissionNumber})`);
            l.summativeResults.forEach(r => {
                console.log(`  - ${r.test.title} (${r.test.academicYear}): ${r.marksObtained}`);
            });
            totalScores += l.summativeResults.length;
        }
    }
    console.log(`\nTotal scores trapped in numeric records: ${totalScores}`);
}

checkNumericScores()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
