import { PrismaClient } from '@prisma/client';

// Production Neon Database URL
const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function checkProductionSetup() {
  try {
    console.log("🔍 Checking Production Database (Neon)...\n");

    // Check if Template School exists
    const templateSchool = await prisma.school.findUnique({
      where: { name: "Template School" },
    });

    if (!templateSchool) {
      console.log("❌ Template School NOT found in production");
      return;
    }

    console.log("✅ Template School found in production");
    console.log(`   ID: ${templateSchool.id}`);
    console.log(`   Status: ${templateSchool.status}\n`);

    // Check for Template School users
    const users = await prisma.user.findMany({
      where: {
        email: {
          endsWith: "@template.test",
        },
      },
      select: {
        email: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

    console.log(`📊 Found ${users.length} Template School users in production:\n`);

    if (users.length > 0) {
      users.forEach((user) => {
        const emailStatus = user.emailVerified ? "✓" : "✗";
        console.log(`  ✅ ${user.role.padEnd(12)} | ${user.email.padEnd(30)} | Status: ${user.status} | Email Verified: ${emailStatus}`);
      });
    } else {
      console.log("  ❌ No Template School users found in production!");
    }

    // Check for learners
    console.log("\n");
    const learners = await prisma.learner.findMany({
      where: {
        admissionNumber: {
          startsWith: "STU",
        },
      },
      select: {
        admissionNumber: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    console.log(`📚 Found ${learners.length} sample learners in production:\n`);
    if (learners.length > 0) {
      learners.forEach((learner) => {
        console.log(`  ✅ ${learner.admissionNumber} | ${learner.firstName} ${learner.lastName} | Status: ${learner.status}`);
      });
    }

    // Check branches and classes
    console.log("\n");
    const branches = await prisma.branch.findMany({
      where: {
        school: {
          name: "Template School",
        },
      },
      include: {
        classes: true,
      },
    });

    console.log(`🏢 Found ${branches.length} branches in Template School:\n`);
    branches.forEach((branch) => {
      console.log(`  ✅ Branch: ${branch.name} (${branch.classes.length} classes)`);
      branch.classes.forEach((cls) => {
        console.log(`     └─ Class: ${cls.name}`);
      });
    });

    console.log("\n✅ Production Database Check Complete!");
    console.log("\n🎯 SUMMARY:");
    console.log(`   - Template School: ${templateSchool ? "✅ EXISTS" : "❌ MISSING"}`);
    console.log(`   - Users: ${users.length}/7 found`);
    console.log(`   - Learners: ${learners.length}/3 found`);
    console.log(`   - Branches: ${branches.length}/1 found`);

    if (users.length === 7 && learners.length === 3 && branches.length === 1) {
      console.log("\n🚀 STATUS: PRODUCTION READY - All users can login to production!");
    } else {
      console.log("\n⚠️  STATUS: Partial setup - Some data is missing in production");
    }
  } catch (error) {
    console.error("❌ Error checking production database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionSetup();
