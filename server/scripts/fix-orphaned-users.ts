
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ZAWADI_SCHOOL_ID = '6780e055-b6fe-41c8-9d01-0a10621f2b55';

async function fixOrphanedUsers() {
  try {
    // 1. Find orphaned users (excluding SUPER_ADMIN)
    const orphanedUsers = await prisma.user.findMany({
      where: {
        schoolId: null,
        role: {
          not: 'SUPER_ADMIN'
        }
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    console.log(`Found ${orphanedUsers.length} orphaned users.`);

    if (orphanedUsers.length === 0) {
      console.log('No orphaned users to fix.');
      return;
    }

    // 2. Assign to Zawadi Junior Academy
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: orphanedUsers.map(u => u.id)
        }
      },
      data: {
        schoolId: ZAWADI_SCHOOL_ID
      }
    });

    console.log(`Successfully assigned ${result.count} users to Zawadi Junior Academy (${ZAWADI_SCHOOL_ID}).`);

    // 3. Verify
    const remainingOrphans = await prisma.user.count({
      where: {
        schoolId: null,
        role: {
          not: 'SUPER_ADMIN'
        }
      }
    });

    if (remainingOrphans === 0) {
      console.log('✅ Verification Successful: No orphaned users remain.');
    } else {
      console.error(`❌ Verification Failed: ${remainingOrphans} users are still orphaned.`);
    }

  } catch (error) {
    console.error('Error fixing orphaned users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanedUsers();
