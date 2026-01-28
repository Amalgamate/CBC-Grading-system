
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listSchools() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log('--- SCHOOLS LIST ---');
    console.table(schools);
    console.log(`Total Schools: ${schools.length}`);
  } catch (error) {
    console.error('Error listing schools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listSchools();
