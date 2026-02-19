/**
 * Cleanup Script: Remove Streams B, C, D and their classes
 * Keeps only Stream A
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupStreams() {
  try {
    console.log('🧹 Starting stream cleanup...\n');

    // 1. Delete all classes with streams B, C, D
    const classesDeleted = await prisma.class.deleteMany({
      where: {
        stream: {
          in: ['B', 'C', 'D']
        }
      }
    });

    console.log(`✅ Deleted ${classesDeleted.count} classes (Streams B, C, D)`);

    console.log('\n✨ Stream cleanup complete!');
    console.log('📊 Summary:');
    console.log(`   - Classes removed: ${classesDeleted.count}`);
    console.log(`   - Remaining: Only Stream A with all grades`);

  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupStreams();
