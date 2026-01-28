
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listBranches() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        school: {
          select: { name: true }
        }
      }
    });

    console.log('--- BRANCHES LIST ---');
    console.table(branches.map(b => ({
      id: b.id,
      name: b.name,
      school: b.school.name,
      schoolId: b.schoolId
    })));
  } catch (error) {
    console.error('Error listing branches:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listBranches();
