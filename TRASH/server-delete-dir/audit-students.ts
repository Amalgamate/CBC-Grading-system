
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditStudents() {
    console.log('🔍 Auditing PP1 and PP2 students...');

    const learners = await prisma.learner.findMany({
        where: {
            grade: { in: ['PP1', 'PP2'] }
        },
        orderBy: { lastName: 'asc' }
    });

    const groups: Record<string, any[]> = {};

    learners.forEach(l => {
        const key = `${l.firstName} ${l.lastName}`.toUpperCase().trim();
        if (!groups[key]) groups[key] = [];
        groups[key].push(l);
    });

    console.log('\n--- Duplicate Detection ---');
    let duplicateCount = 0;
    for (const [name, list] of Object.entries(groups)) {
        if (list.length > 1) {
            duplicateCount++;
            console.log(`\nPotential Duplicate: ${name}`);
            list.forEach(l => {
                console.log(`  - [${l.id}] Adm: ${l.admissionNumber}, Grade: ${l.grade}`);
            });
        }
    }
    console.log(`\nTotal duplicate groups found: ${duplicateCount}`);

    console.log('\n--- Score Tally (2026) ---');
    for (const l of learners) {
        const scoreCount = await prisma.summativeResult.count({
            where: {
                learnerId: l.id,
                test: {
                    academicYear: 2026
                }
            }
        });
        if (scoreCount === 0) {
            console.log(`🚩 No 2026 scores for: ${l.firstName} ${l.lastName} (${l.admissionNumber})`);
        } else {
            // console.log(`✅ ${scoreCount} scores for: ${l.firstName} ${l.lastName} (${l.admissionNumber})`);
        }
    }
}

auditStudents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
