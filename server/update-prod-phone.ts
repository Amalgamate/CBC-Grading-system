import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function updateProdPhones() {
  try {
    console.log("📱 Updating PRODUCTION template users to +254 713 612 141...\n");

    const emails = [
      "superadmin@template.test",
      "admin@template.test",
      "teacher@template.test",
      "accountant@template.test",
      "receptionist@template.test",
      "parent1@template.test",
      "parent2@template.test",
    ];

    for (const email of emails) {
      await prisma.user.update({
        where: { email },
        data: { phone: "+254 713 612 141" },
      });
      console.log(`✅ ${email}`);
    }

    console.log("\n✅ PRODUCTION: All template users now send OTP to +254 713 612 141");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProdPhones();
