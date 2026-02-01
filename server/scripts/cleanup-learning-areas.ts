/**
 * Cleanup Learning Areas Script
 * Deletes all learning areas from the database for fresh testing
 */

import prisma from '../src/config/database';

async function cleanupLearningAreas() {
  try {
    console.log('🧹 Starting learning areas cleanup...\n');

    const deleted = await prisma.learningArea.deleteMany({});

    console.log('✅ Cleanup completed!');
    console.log(`   Deleted: ${deleted.count} learning areas`);
    console.log('\n💡 You can now test the seed button to populate fresh data');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupLearningAreas();
