import prisma from './src/config/database';

async function cleanup() {
  console.log('🧹 Cleaning up old classes from Template School...');

  const template = await prisma.school.findFirst({
    where: { name: 'Template School' },
    include: { branches: true }
  });

  if (!template) {
    console.log('❌ Template School not found');
    await prisma.$disconnect();
    process.exit(1);
  }

  for (const branch of template.branches) {
    const classCount = await prisma.class.count({ where: { branchId: branch.id } });
    if (classCount > 0) {
      console.log(`  Deleting ${classCount} classes from branch "${branch.name}"...`);
      await prisma.class.deleteMany({ where: { branchId: branch.id } });
      console.log(`  ✅ Deleted successfully`);
    }
  }

  console.log('\n✅ Cleanup complete! Classes are ready to be recreated.');
  await prisma.$disconnect();
}

cleanup();
