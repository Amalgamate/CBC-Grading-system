import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllTeachers() {
  try {
    console.log('🔍 Fetching all teachers from production...\n');
    
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📚 Found ${teachers.length} teachers:\n`);
    
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.firstName} ${teacher.lastName}`);
      console.log(`   ID: ${teacher.id}`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Username: ${teacher.username || 'Not set'}`);
      console.log(`   Phone: ${teacher.phone || 'N/A'}`);
      console.log(`   School ID: ${teacher.schoolId}`);
      console.log('');
    });

    console.log(`\n✅ Total: ${teachers.length} teachers`);

    return teachers;
  } catch (error) {
    console.error('❌ Error fetching teachers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

getAllTeachers();
