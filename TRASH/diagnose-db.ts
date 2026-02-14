import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 CHECKING DATABASE STATE FOR STUDENT CREATION\n');

  try {
    // Check schools
    const schools = await prisma.school.count();
    console.log(`✅ Schools: ${schools}`);

    // Check branches
    const branches = await prisma.branch.count();
    console.log(`✅ Branches: ${branches}`);

    // Check admissionSequences
    const sequences = await prisma.admissionSequence.count();
    console.log(`✅ Admission Sequences: ${sequences}`);

    // Check users (should be at least admin)
    const users = await prisma.user.count();
    console.log(`✅ Users: ${users}`);

    // Check if we can look up a school
    const school = await prisma.school.findFirst();
    if (school) {
      console.log(`\n📍 First School Found: ${school.name} (${school.id})`);
      
      // Check branches for this school
      const branchesForSchool = await prisma.branch.findMany({
        where: { schoolId: school.id }
      });
      console.log(`   Branches: ${branchesForSchool.length}`);
      branchesForSchool.forEach(b => console.log(`     - ${b.name} (${b.code})`));

      // Check if sequence exists for this school
      const currentYear = new Date().getFullYear();
      const seq = await prisma.admissionSequence.findUnique({
        where: { schoolId_academicYear: { schoolId: school.id, academicYear: currentYear } }
      });
      console.log(`   Sequence for Year ${currentYear}: ${seq ? 'EXISTS' : 'MISSING (will auto-create)'}`);
    } else {
      console.log('\n❌ NO SCHOOLS FOUND - This is the problem!');
    }

    // Check learners
    const learnerCount = await prisma.learner.count();
    console.log(`\n✅ Existing Learners: ${learnerCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
