import 'dotenv/config';
import prisma from '../src/config/database';

async function main() {
  const args = process.argv.slice(2);
  let name = 'A';
  let schoolId: string | undefined;
  let active = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (arg === '--schoolId' && args[i + 1]) {
      schoolId = args[i + 1];
      i++;
    } else if (arg === '--inactive') {
      active = false;
    }
  }

  let school;
  if (schoolId) {
    school = await prisma.school.findUnique({ where: { id: schoolId } });
  } else {
    school = await prisma.school.findFirst({ where: { active: true } });
  }

  if (!school) {
    throw new Error('No active school found. Provide --schoolId explicitly.');
  }

  const result = await prisma.streamConfig.upsert({
    where: {
      schoolId_name: {
        schoolId: school.id,
        name,
      },
    },
    update: {
      active,
    },
    create: {
      schoolId: school.id,
      name,
      active,
    },
  });

  console.log(JSON.stringify({ success: true, data: result }, null, 2));
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
