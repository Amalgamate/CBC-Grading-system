import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkParentLinks() {
    try {
        // 1. Find "Guyo Guardian"
        const parents = await prisma.user.findMany({
            where: {
                OR: [
                    { firstName: { contains: 'Guyo', mode: 'insensitive' } },
                    { lastName: { contains: 'Guardian', mode: 'insensitive' } },
                    { firstName: { contains: 'Guardian', mode: 'insensitive' } },
                ],
                role: 'PARENT'
            },
            include: {
                learners: true // Get linked learners
            }
        });

        console.log(`Found ${parents.length} matching parents:`);

        for (const p of parents) {
            console.log(`\n--- Parent: ${p.firstName} ${p.lastName} (${p.id}) ---`);
            console.log(`  Phone: ${p.phone}`);
            console.log(`  Email: ${p.email}`);
            console.log(`  Linked Learners (${p.learners.length}):`);
            p.learners.forEach(l => console.log(`    - ${l.firstName} ${l.lastName} (${l.admissionNumber})`));

            // Check if there are unlinked learners that *look* like they should belong to this parent
            // e.g. matching phone numbers in learner record
            const potentialMatches = await prisma.learner.findMany({
                where: {
                    OR: [
                        { fatherPhone: p.phone },
                        { motherPhone: p.phone },
                        { guardianPhone: p.phone },
                        { emergencyPhone: p.phone }
                    ],
                    parentId: { not: p.id } // Exclude already linked
                }
            });

            if (potentialMatches.length > 0) {
                console.log(`  Found ${potentialMatches.length} potentially unlinked learners (matching phone):`);
                potentialMatches.forEach(l => console.log(`    - ${l.firstName} ${l.lastName} (${l.admissionNumber}) [ParentID: ${l.parentId}]`));
            } else {
                console.log(`  No unlinked phone matches found.`);
            }
        }

    } catch (error) {
        console.error('Error checking parent links:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkParentLinks();
