import prisma from './src/config/database';

async function check() {
  const template = await prisma.school.findFirst(
    {
      where: { name: 'Template School' },
      include: { streamConfigs: true, branches: { include: { classes: true } } }
    }
  );
  if (template) {
    console.log('Template School:');
    console.log('  Streams:', template.streamConfigs.length);
    template.streamConfigs.forEach((s: any) => console.log('    -', s.name));
    template.branches.forEach((b: any) => {
      console.log('  Branch:', b.name, 'Classes:', b.classes.length);
      if (b.classes.length > 0) {
        console.log('    Sample classes:');
        b.classes.slice(0, 5).forEach((c: any) => console.log('      -', c.name));
      }
    });
  }
  await prisma.$disconnect();
}
check();
