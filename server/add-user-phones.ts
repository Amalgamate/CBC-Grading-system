import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPhonesToTemplateUsers() {
  try {
    console.log("📱 Adding phone numbers to template users...\n");

    // Phone numbers for each user
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

    console.log("\n✅ All template users now have phone numbers!");
    console.log("\n📊 OTP WILL NOW BE SENT TO:");
    phoneUpdates.forEach((u) => {
      console.log(`   ${u.email} → ${u.phone}`);
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPhonesToTemplateUsers();
