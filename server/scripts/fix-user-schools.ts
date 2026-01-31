import prisma from '../src/config/database';

async function fixUserSchools() {
  try {
    // Get the school
    const school = await prisma.school.findFirst({
      select: { id: true, name: true }
    });

    if (!school) {
      console.error('❌ No school found');
      process.exit(1);
    }

    console.log(`Found school: ${school.name} (${school.id})`);

    // Update all users to have this schoolId (except SUPER_ADMIN)
    const result = await prisma.user.updateMany({
      where: {
        role: { not: 'SUPER_ADMIN' }
      },
      data: {
        schoolId: school.id
      }
    });

    console.log(`✅ Updated ${result.count} users to schoolId: ${school.id}`);
    
    // Also verify all users now have the school
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        schoolId: true,
        phone: true
      }
    });

    console.log('\n📋 User List:');
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) | School: ${u.schoolId || 'NONE'} | Phone: ${u.phone}`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserSchools();
