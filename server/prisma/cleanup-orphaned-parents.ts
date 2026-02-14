
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Cleanup Started ---');

    // 1. Unarchive parents of active learners
    const activeLearners = await prisma.learner.findMany({
        where: { archived: false, status: 'ACTIVE' },
        select: { parentId: true }
    });

    const activeParentIds = activeLearners
        .map(l => l.parentId)
        .filter((id): id is string => id !== null);

    if (activeParentIds.length > 0) {
        const unarchiveResult = await prisma.user.updateMany({
            where: {
                id: { in: activeParentIds },
                archived: true
            },
            data: {
                archived: false,
                archivedAt: null,
                archivedBy: null,
                status: 'ACTIVE'
            }
        });
        console.log(`Unarchived ${unarchiveResult.count} parents of active learners.`);
    }

    // 2. Archive parents with NO active learners
    // These are parents who might have dropped students or no students at all
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
        select: { id: true }
    });

    const orphanedParentIds = orphanedParents.map(p => p.id);

    if (orphanedParentIds.length > 0) {
        const archiveResult = await prisma.user.updateMany({
            where: {
                id: { in: orphanedParentIds }
            },
            data: {
                archived: true,
                archivedAt: new Date(),
                status: 'INACTIVE'
            }
        });
        console.log(`Archived ${archiveResult.count} orphaned parents.`);
    }

    console.log('--- Database Cleanup Finished ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
