
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Final Audit Start ---');

    const activeLearners = await prisma.learner.findMany({
        where: { archived: false, status: 'ACTIVE' },
        include: { parent: true }
    });

    console.log(`Active Learners: ${activeLearners.length}`);
    for (const learner of activeLearners) {
        console.log(`Learner: ${learner.firstName} ${learner.lastName} (${learner.admissionNumber})`);
        if (learner.parent) {
            console.log(`  Parent: ${learner.parent.firstName} ${learner.parent.lastName} (${learner.parent.email}) - Archived: ${learner.parent.archived}, Status: ${learner.parent.status}`);
        } else {
            console.log('  Parent: NONE');
        }
    }

    const orphanedParents = await prisma.user.findMany({
        where: {
            role: 'PARENT',
            archived: false,
            learners: {
                every: {
                    OR: [
                        { archived: true },
                        { status: { not: 'ACTIVE' } }
                    ]
                }
            }
        },
        select: { id: true, firstName: true, lastName: true }
    });

    console.log(`\nActive parents with NO active students (to archive): ${orphanedParents.length}`);

    console.log('--- Final Audit End ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
