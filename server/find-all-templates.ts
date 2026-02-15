import prisma from './src/config/database';

async function check() {
  console.log('🔍 Searching for Template schools...\n');

  const schools = await prisma.school.findMany({
    where: {
      name: {
        contains: 'Template',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      registrationNo: true,
      status: true
    }
  });

  console.log(`Found ${schools.length} schools with "Template" in name:\n`);
  schools.forEach(s => {
    console.log(`📍 ${s.name}`);
    console.log(`   ID: ${s.id}`);
    console.log(`   Registration: ${s.registrationNo}`);
    console.log(`   Status: ${s.status}`);
    console.log();
  });

  // Also check for "Template School" specifically
  const templateSchool = await prisma.school.findFirst({
    where: { name: 'Template School' }
  });

  if (templateSchool) {
    console.log(`✅ "Template School" exists (ID: ${templateSchool.id})`);
    const feeCount = await prisma.feeType.count({
      where: { schoolId: templateSchool.id }
    });
    console.log(`   Fee Types: ${feeCount}`);
  } else {
    console.log('❌ "Template School" does NOT exist');
  }

  await prisma.$disconnect();
}

check().catch(console.error);
