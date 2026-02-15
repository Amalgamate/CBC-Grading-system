import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function checkProduction() {
  try {
    console.log("🔍 Checking Production Database...\n");

    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            users: true,
            branches: true,
          },
        },
      },
    });

    console.log(`📊 Found ${schools.length} schools in production:\n`);
    schools.forEach((school) => {
      console.log(`  ✓ ${school.name}`);
      console.log(`    - ID: ${school.id}`);
      console.log(`    - Status: ${school.status}`);
      console.log(`    - Users: ${school._count.users} | Branches: ${school._count.branches}\n`);
    });

    // Count total users
    const userCount = await prisma.user.count();
    const learnerCount = await prisma.learner.count();

    console.log(`\n📈 PRODUCTION STATS:`);
    console.log(`   - Total Users: ${userCount}`);
    console.log(`   - Total Learners: ${learnerCount}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduction();
