import prisma from './src/config/database';

async function check() {
  const learner = await prisma.learner.findFirst({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      guardianName: true,
      guardianPhone: true,
      fatherPhone: true,
      motherPhone: true,
      primaryContactPhone: true
    }
  });
  console.log(JSON.stringify(learner, null, 2));
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
