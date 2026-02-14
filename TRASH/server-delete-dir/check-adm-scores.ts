
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmScores() {
    console.log('🔍 Checking scores on ADM records...');

    const learners = await prisma.learner.findMany({
        where: {
            grade: { in: ['PP1', 'PP2'] },
            admissionNumber: { startsWith: 'ADM-' }
        },
        include: {
            summativeResults: {
                include: { test: true }
            }
        }
    });

    console.log(`Found ${learners.length} ADM learners in PP1/PP2.`);

    let totalScores = 0;
    let studentsWithNoScores = 0;

    for (const l of learners) {
        if (l.summativeResults.length > 0) {
            totalScores += l.summativeResults.length;
        } else {
            studentsWithNoScores++;
            console.log(`🚩 No scores for: ${l.firstName} ${l.lastName} (${l.admissionNumber})`);
        }
    }

    console.log(`\nResults:`);
    console.log(`Total students with ADM: ${learners.length}`);
    console.log(`Students with NO scores: ${studentsWithNoScores}`);
    console.log(`Total scores in system for these students: ${totalScores}`);
}

checkAdmScores()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
