
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Even more aggressive fuzzy matching for the final few
function areSimilarAggressive(name1: string, name2: string): boolean {
    const n1 = name1.toUpperCase().replace(/[^A-Z]/g, '');
    const n2 = name2.toUpperCase().replace(/[^A-Z]/g, '');

    // Check if the first 4 letters match (common for names)
    if (n1.substring(0, 4) === n2.substring(0, 4)) return true;

    // Or check if most of the tokens match
    const parts1 = name1.toUpperCase().split(/\s+|-/);
    const parts2 = name2.toUpperCase().split(/\s+|-/);

    const intersection = parts1.filter(p => p.length > 2 && parts2.includes(p));
    if (intersection.length >= 1) return true;

    return false;
}

async function finalCleanup() {
    console.log('🧹 Starting Final Targeted Cleanup...');

    const grade = 'PP1';
    const learners = await prisma.learner.findMany({
        where: { grade: grade as any }
    });

    const admLearners = learners.filter(l => l.admissionNumber.startsWith('ADM-'));
    const oldLearners = learners.filter(l => !l.admissionNumber.startsWith('ADM-'));

    for (const old of oldLearners) {
        const oldFullName = `${old.firstName} ${old.lastName}`.trim();

        const match = admLearners.find(adm => {
            const admFullName = `${adm.firstName} ${adm.lastName}`.trim();
            return areSimilarAggressive(oldFullName, admFullName);
        });

        if (match) {
            console.log(`   ✨ Final Match: "${oldFullName}" (${old.admissionNumber}) -> "${match.firstName} ${match.lastName}" (${match.admissionNumber})`);

            await prisma.summativeResult.updateMany({
                where: { learnerId: old.id },
                data: { learnerId: match.id }
            });

            await prisma.learner.delete({
                where: { id: old.id }
            });
        }
    }
    console.log('🏁 Final Cleanup Complete!');
}

finalCleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
