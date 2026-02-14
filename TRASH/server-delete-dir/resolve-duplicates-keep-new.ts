
import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

async function resolveDuplicates() {
    console.log('🧹 Resolving duplicates (Keeping NEW, Deleting OLD)...');

    const school = await prisma.school.findFirst({
        where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
        console.error('❌ School not found.');
        return;
    }

    const grades = [Grade.PP1, Grade.PP2];

    for (const grade of grades) {
        console.log(`\nProcessing Grade: ${grade}`);

        // Get all learners
        const learners = await prisma.learner.findMany({
            where: { schoolId: school.id, grade: grade },
            orderBy: { createdAt: 'desc' } // Newest first usually
        });

        // Group by normalized name
        const grouped: Record<string, typeof learners> = {};

        for (const l of learners) {
            const key = `${l.firstName.trim().toLowerCase()}|${l.lastName.trim().toLowerCase()}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(l);
        }

        let deletedCount = 0;

        for (const key in grouped) {
            const group = grouped[key];
            if (group.length > 1) {
                // We have duplicates
                const name = `${group[0].firstName} ${group[0].lastName}`;

                // Find the "New" one (StartsWith ADM-{Grade})
                const newRecord = group.find(l => l.admissionNumber.startsWith(`ADM-${grade}`));

                if (newRecord) {
                    // We have a new record from the Excel seed.
                    // All GUARANTEED to be old records are the others.
                    const oldRecords = group.filter(l => l.id !== newRecord.id);

                    console.log(`   Found duplicate for "${name}":`);
                    console.log(`      ✅ KEEPING: ${newRecord.admissionNumber}`);

                    for (const old of oldRecords) {
                        console.log(`      ❌ DELETING: ${old.admissionNumber} (ID: ${old.id})`);

                        // DELETE OPERATION
                        await prisma.learner.delete({
                            where: { id: old.id }
                        });
                        deletedCount++;
                    }
                } else {
                    // Duplicates exist but NONE match the new format? 
                    // This might be two old records. Skip for now as per "Keep from New" instruction.
                    console.log(`   ⚠️  Duplicate found for "${name}" but NO new Excel record found. Skipping.`);
                    group.forEach(g => console.log(`      - ${g.admissionNumber}`));
                }
            }
        }
        console.log(`   ✅ Removed ${deletedCount} old records for ${grade}.`);
    }
}

resolveDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
