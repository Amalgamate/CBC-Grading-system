import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    const deleted = await prisma.class.deleteMany({
      where: {
        academicYear: 2025,
        term: 'TERM_1'
      }
    });
    console.log(`Deleted ${deleted.count} classes`);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
