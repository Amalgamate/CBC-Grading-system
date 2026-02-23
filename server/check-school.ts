import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst({
    where: { name: 'ZAWADI JUNIOR ACADEMY' }
  });
  console.log('School ID:', school?.id);
  console.log('School Name:', school?.name);
  
  // Also check for any existing grading systems
  const scales = await prisma.gradingSystem.findMany({
    where: { schoolId: school?.id },
    take: 5
  });
  console.log('Existing scales:', scales.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
