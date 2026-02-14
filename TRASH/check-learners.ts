import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLearners() {
  console.log('🔍 CHECKING LEARNER DATA IN DATABASE\n');

  try {
    // Count total learners
    const totalCount = await prisma.learner.count();
    console.log(`📚 Total Learners: ${totalCount}`);

    if (totalCount > 0) {
      // Get first 5 learners
      const learners = await prisma.learner.findMany({ take: 5 });
      
      console.log('\n📋 Sample Learners:');
      learners.forEach((l: any, idx: number) => {
        console.log(`
  ${idx + 1}. ${l.firstName} ${l.lastName}
     - Admission: ${l.admissionNumber}
     - Grade: ${l.grade}
     - Status: ${l.status}
     - Created: ${l.createdAt}`);
      });

      // Count by status
      const byStatus = await prisma.learner.groupBy({
        by: ['status'],
        _count: true
      });

      console.log('\n📊 By Status:');
      byStatus.forEach(s => {
        console.log(`   ${s.status}: ${s._count}`);
      });

      // Count by grade
      const byGrade = await prisma.learner.groupBy({
        by: ['grade'],
        _count: true,
        orderBy: { grade: 'asc' }
      });

      console.log('\n📚 By Grade:');
      byGrade.forEach(g => {
        console.log(`   ${g.grade}: ${g._count}`);
      });
    } else {
      console.log('❌ No learners found in database');
    }

    // Check if school/branch exist
    const school = await prisma.school.findFirst();
    const branches = await prisma.branch.count();
    const streams = await prisma.streamConfig.count();

    console.log('\n✅ Database Summary:');
    console.log(`   Schools: 1 (${school?.name})`);
    console.log(`   Branches: ${branches}`);
    console.log(`   Streams: ${streams}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLearners();
