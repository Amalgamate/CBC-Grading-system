
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) {
        tmp[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        tmp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
}

function areSimilar(name1: string, name2: string): boolean {
    const n1 = name1.toUpperCase().replace(/[^A-Z]/g, '');
    const n2 = name2.toUpperCase().replace(/[^A-Z]/g, '');

    // Exact containment
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Fuzzy match if they are long enough
    const dist = levenshtein(n1, n2);
    const maxLen = Math.max(n1.length, n2.length);
    const similarity = 1 - (dist / maxLen);

    return similarity > 0.7; // 70% similarity threshold
}

async function globalCleanup() {
    console.log('🧹 Starting Global Duplicate Cleanup...');

    const grades = ['PP1', 'PP2']; // Can expand later

    for (const grade of grades) {
        console.log(`\n📋 Processing ${grade}...`);
        const learners = await prisma.learner.findMany({
            where: { grade: grade as any }
        });

        const admLearners = learners.filter(l => l.admissionNumber.startsWith('ADM-'));
        const oldLearners = learners.filter(l => !l.admissionNumber.startsWith('ADM-'));

        console.log(`   Found ${admLearners.length} ADM records and ${oldLearners.length} old records.`);

        for (const old of oldLearners) {
            const oldFullName = `${old.firstName} ${old.lastName}`.trim();

            // Find best match in ADM records
            const match = admLearners.find(adm => {
                const admFullName = `${adm.firstName} ${adm.lastName}`.trim();
                return areSimilar(oldFullName, admFullName);
            });

            if (match) {
                console.log(`   ✨ Matching: "${oldFullName}" (${old.admissionNumber}) -> "${match.firstName} ${match.lastName}" (${match.admissionNumber})`);

                // 1. Migrate Results
                console.log(`      - Migrating results...`);
                await prisma.summativeResult.updateMany({
                    where: { learnerId: old.id },
                    data: { learnerId: match.id }
                });

                // 2. Migrate Attendance
                await prisma.attendance.updateMany({
                    where: { learnerId: old.id },
                    data: { learnerId: match.id }
                });

                // 3. Migrate Formative Assessments
                await prisma.formativeAssessment.updateMany({
                    where: { learnerId: old.id },
                    data: { learnerId: match.id }
                });

                // 4. Delete old record
                console.log(`      - Deleting stale record ${old.id}`);
                await prisma.learner.delete({
                    where: { id: old.id }
                });
            } else {
                console.log(`   ❓ No match for old record: "${oldFullName}" (${old.admissionNumber})`);
            }
        }
    }

    console.log('\n🏁 Global Cleanup Complete!');
}

globalCleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
