import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLocalPhones() {
  try {
    console.log("📱 Updating LOCAL template users to +254 713 612 141...\n");

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

    console.log("\n✅ LOCAL: All template users now send OTP to +254 713 612 141");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateLocalPhones();
