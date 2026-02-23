import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Count total learners
    const totalLearners = await prisma.learner.count();
    console.log(`\n📊 Total Learners in Database: ${totalLearners}\n`);

    // Get count by grade
    const byGrade = await prisma.learner.groupBy({
      by: ['grade'],
      _count: {
        id: true
      },
      orderBy: {
        grade: 'asc'
      }
    });

    console.log('📚 Learners by Grade:');
    byGrade.forEach(g => {
      console.log(`  ${g.grade}: ${g._count.id}`);
    });

    // Get count by school
    const bySchool = await prisma.learner.groupBy({
      by: ['schoolId'],
      _count: {
        id: true
      }
    });

    console.log(`\n🏫 Learners by School (${bySchool.length} schools):`);
    for (const school of bySchool) {
      const schoolData = await prisma.school.findUnique({
        where: { id: school.schoolId },
        select: { name: true }
      });
      console.log(`  ${schoolData?.name || 'Unknown'}: ${school._count.id}`);
    }

    // Sample 10 learners
    const samples = await prisma.learner.findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        grade: true,
        school: { select: { name: true } }
      }
    });

    console.log(`\n📋 Sample of 10 Learners:`);
    samples.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.firstName} ${s.lastName} (Adm: ${s.admissionNumber}, Grade: ${s.grade}, School: ${s.school.name})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
