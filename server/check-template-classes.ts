import prisma from './src/config/database';

async function check() {
  const template = await prisma.school.findFirst({
    where: { name: 'Template School' },
    include: { branches: { include: { classes: true } } }
  });

  if (template) {
    console.log('Template School Branches and Classes:');
    for (const branch of template.branches) {
      console.log(`\nBranch: ${branch.name}`);
      console.log(`Total classes: ${branch.classes.length}`);
      
      // Group by grade to see if we have 4 streams per grade
      const byGrade: Record<string, any[]> = {};
      branch.classes.forEach((c: any) => {
        if (!byGrade[c.grade]) byGrade[c.grade] = [];
        byGrade[c.grade].push(c);
      });

      console.log(`Unique grades: ${Object.keys(byGrade).length}`);
      Object.entries(byGrade).forEach(([grade, classes]: [string, any[]]) => {
        console.log(`  ${grade}: ${classes.length} classes`);
        classes.forEach(c => console.log(`    - ${c.name}`));
      });
    }
  }
  await prisma.$disconnect();
}
check();
