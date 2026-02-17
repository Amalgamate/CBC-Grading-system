const { PrismaClient } = require('@prisma/client');

// Use environment DATABASE_URL (local dev database with migrations applied)
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 Searching for all ADMIN users...\n');
    
    // Get all ADMIN users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        role: true,
        status: true,
        school: {
          select: {
            name: true,
            id: true,
            county: true,
            email: true
          }
        }
      }
    });

    console.log(`Found ${admins.length} admin(s):\n`);
    
    admins.forEach((admin, idx) => {
      console.log(`${idx + 1}. ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username || 'N/A'}`);
      console.log(`   Phone: ${admin.phone || 'N/A'}`);
      console.log(`   Status: ${admin.status}`);
      if (admin.school) {
        console.log(`   School: ${admin.school.name} (${admin.school.county || 'N/A'})`);
        console.log(`   School Email: ${admin.school.email || 'N/A'}`);
      } else {
        console.log(`   School: No school assigned (SUPER_ADMIN?)`);
      }
      console.log('');
    });

    // Search specifically for Zawadi (case-insensitive)
    console.log('\n--- ZAWADI ADMINS ---\n');
    const zawadi = admins.filter(a => a.school && a.school.name.toLowerCase().includes('zawadi'));
    if (zawadi.length > 0) {
      zawadi.forEach(admin => {
        console.log(`✓ ${admin.firstName} ${admin.lastName}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Phone: ${admin.phone || 'N/A'}`);
        console.log(`  School: ${admin.school.name}`);
      });
    } else {
      console.log('❌ No Zawadi admins found');
    }

  } catch(e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
