import prisma from '../src/config/database';

async function cleanSlate() {
  try {
    console.log('🧹 Starting clean slate deletion...\n');

    // Delete all learners (students) - cascades will handle related data
    const learnersDeleted = await prisma.learner.deleteMany({});
    console.log(`✅ Deleted ${learnersDeleted.count} learners (students)\n`);

    // Delete all parent users (users with PARENT role)
    const parentsDeleted = await prisma.user.deleteMany({
      where: {
        role: 'PARENT'
      }
    });
    console.log(`✅ Deleted ${parentsDeleted.count} parents\n`);

    console.log('✅ Clean slate complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Learners deleted: ${learnersDeleted.count}`);
    console.log(`   - Parents deleted: ${parentsDeleted.count}`);
    console.log('   - All related data cascaded (enrollments, assessments, etc.)');
    console.log('\n✨ System is ready for fresh data');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSlate();
