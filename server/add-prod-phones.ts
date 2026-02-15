import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function addPhonesToProductionUsers() {
  try {
    console.log("📱 Adding phone numbers to production template users...\n");

    const phoneUpdates = [
      { email: "superadmin@template.test", phone: "+254 712 111 111" },
      { email: "admin@template.test", phone: "+254 712 222 222" },
      { email: "teacher@template.test", phone: "+254 712 333 333" },
      { email: "accountant@template.test", phone: "+254 712 444 444" },
      { email: "receptionist@template.test", phone: "+254 712 555 555" },
      { email: "parent1@template.test", phone: "+254 712 666 666" },
      { email: "parent2@template.test", phone: "+254 712 777 777" },
    ];

    for (const update of phoneUpdates) {
      const user = await prisma.user.update({
        where: { email: update.email },
        data: { phone: update.phone },
      });
      console.log(`✅ ${update.email}: ${update.phone}`);
    }

    console.log("\n✅ Production users updated!\n");
    console.log("📊 OTP PHONE NUMBERS:");
    phoneUpdates.forEach((u) => {
      console.log(`   ${u.email.padEnd(30)} → ${u.phone}`);
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPhonesToProductionUsers();
