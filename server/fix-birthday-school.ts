/**
 * Update test students to correct school
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSchool() {
  const targetSchoolId = '373edb5d-fc33-466d-8eb0-75cfb8d56712';
  
  console.log('🔄 Updating test students to school:', targetSchoolId);
  
  const result = await prisma.learner.updateMany({
    where: {
      admissionNumber: {
        startsWith: 'BDAY-TEST-'
      }
    },
    data: {
      schoolId: targetSchoolId
    }
  });
  
  console.log(`✅ Updated ${result.count} students`);
  
  // Verify
  const students = await prisma.learner.findMany({
    where: {
      admissionNumber: {
        startsWith: 'BDAY-TEST-'
      }
    },
    select: {
      admissionNumber: true,
      firstName: true,
      lastName: true,
      schoolId: true,
      dateOfBirth: true
    }
  });
  
  console.log('\n✅ Verified students:');
  students.forEach(s => {
    console.log(`   ${s.firstName} ${s.lastName} - School: ${s.schoolId}`);
  });
  
  await prisma.$disconnect();
}

updateSchool();
