const { PrismaClient } = require('@prisma/client');

// Connect to production Neon database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require',
    },
  },
});

(async () => {
  try {
    console.log('🔍 Checking schools on PRODUCTION database...\n');
    
    // Get all schools
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        county: true,
        email: true,
        phone: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (schools.length === 0) {
      console.log('❌ No schools found in production database');
      process.exit(0);
    }

    console.log(`Found ${schools.length} school(s) on production:\n`);
    
    schools.forEach((school, idx) => {
      console.log(`${idx + 1}. ${school.name}`);
      console.log(`   County: ${school.county || 'N/A'}`);
      console.log(`   Email: ${school.email || 'N/A'}`);
      console.log(`   Phone: ${school.phone || 'N/A'}`);
      console.log(`   Users: ${school._count.users}`);
      console.log('');
    });

    // Check for Zawadi
    console.log('\n--- ZAWADI CHECK ---\n');
    const zawadi = schools.filter(s => s.name.toLowerCase().includes('zawadi'));
    if (zawadi.length > 0) {
      console.log('✓ Zawadi school(s) found:');
      zawadi.forEach(s => console.log(`  - ${s.name}`));
    } else {
      console.log('❌ NO ZAWADI SCHOOL FOUND ON PRODUCTION');
    }

  } catch(e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
