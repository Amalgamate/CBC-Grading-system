import prisma from './src/config/database';

async function check() {
  const template = await prisma.school.findFirst({
    where: { name: 'Template School' }
  });

  if (!template) {
    console.log('❌ Template School not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ Found: ${template.name} (ID: ${template.id})`);

  const feeCount = await prisma.feeType.count({
    where: { schoolId: template.id }
  });

  console.log(`\nFee Types for ${template.name}: ${feeCount}`);

  if (feeCount > 0) {
    const types = await prisma.feeType.findMany({
      where: { schoolId: template.id },
      orderBy: { name: 'asc' }
    });
    console.log('\nExisting Fee Types:');
    types.forEach(t => {
      console.log(`  - ${t.code}: ${t.name} (${t.isActive ? 'Active' : 'Inactive'})`);
    });
  } else {
    console.log('No fee types exist - seeding should work!');
  }

  await prisma.$disconnect();
}

check().catch(console.error);
