import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function syncTemplateUsers() {
  try {
    console.log("🔄 Syncing Template School to Production...\n");

    // Get the production template school
    const templateSchool = await prisma.school.findUnique({
      where: { name: "EDucore Template" },
      include: {
        branches: {
          include: {
            classes: true,
          },
        },
      },
    });

    if (!templateSchool) {
      console.log("❌ EDucore Template school not found in production!");
      return;
    }

    console.log(`✅ Found EDucore Template (ID: ${templateSchool.id})\n`);

    // User data to sync
    const usersToAdd = [
      { email: "superadmin@template.test", name: "Super Admin", role: "SUPER_ADMIN", password: "TemplateAdmin123!@#" },
      { email: "admin@template.test", name: "Admin User", role: "ADMIN", password: "TemplateAdmin123!@#" },
      { email: "teacher@template.test", name: "Jane Teacher", role: "TEACHER", password: "TemplateTeacher123!@#" },
      { email: "accountant@template.test", name: "John Accountant", role: "ACCOUNTANT", password: "TemplateAcct123!@#" },
      { email: "receptionist@template.test", name: "Mary Receptionist", role: "RECEPTIONIST", password: "TemplateRecp123!@#" },
      { email: "parent1@template.test", name: "John Student", role: "PARENT", password: "TemplateParent123!@#" },
      { email: "parent2@template.test", name: "James Learner", role: "PARENT", password: "TemplateParent123!@#" },
    ];

    console.log("👥 Adding users to production...\n");
    let addedCount = 0;

    for (const userData of usersToAdd) {
      // Check if user already exists
      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });
      } catch {
        existingUser = null;
      }

      if (existingUser) {
        console.log(`⏭️  ${userData.role.padEnd(12)} | ${userData.email} (already exists)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.email.split("@")[0],
          firstName: userData.name.split(" ")[0],
          lastName: userData.name.split(" ").slice(1).join(" "),
          password: hashedPassword,
          role: userData.role as any,
          status: "ACTIVE",
          emailVerified: true,
          school: {
            connect: {
              id: templateSchool.id,
            },
          },
        },
      });

      console.log(`✅ ${userData.role.padEnd(12)} | ${userData.email}`);
      addedCount++;
    }

    console.log(`\n📊 Added ${addedCount} new users\n`);

    // Learner data
    console.log("📚 Adding learners to production...\n");

    // Check if branch exists
    let mainCampus = templateSchool.branches.find((b) => b.name === "Main Campus");
    if (!mainCampus) {
      // Create if doesn't exist
      mainCampus = await prisma.branch.create({
        data: {
          name: "Main Campus",
          code: "MAIN",
          schoolId: templateSchool.id,
          address: "123 Education Street",
          phone: "+254 712 345 678",
        },
        include: {
          classes: true,
        },
      });
      console.log("✅ Created Main Campus branch");
    }

    // Check if Grade 1A class exists
    let grade1a = mainCampus.classes.find((c) => c.name === "Grade 1A");
    if (!grade1a) {
      grade1a = await prisma.class.create({
        data: {
          name: "Grade 1A",
          grade: "GRADE_1",
          stream: "A",
          branchId: mainCampus.id,
          academicYear: 2026,
          capacity: 40,
        },
      });
      console.log("✅ Created Grade 1A class\n");
    }

    // Learner data
    const learnersToAdd = [
      {
        admissionNumber: "STU001",
        firstName: "Alice",
        lastName: "Student",
        gender: "FEMALE" as const,
        dateOfBirth: new Date("2018-05-15"),
        fatherName: "John Student",
        fatherPhone: "+254 712 111 111",
        motherName: "Mary Student",
        motherPhone: "+254 712 222 222",
      },
      {
        admissionNumber: "STU002",
        firstName: "Bob",
        lastName: "Learner",
        gender: "MALE" as const,
        dateOfBirth: new Date("2018-07-20"),
        fatherName: "James Learner",
        fatherPhone: "+254 712 333 333",
        motherName: "Susan Learner",
        motherPhone: "+254 712 444 444",
      },
      {
        admissionNumber: "STU003",
        firstName: "Carol",
        lastName: "Scholar",
        gender: "FEMALE" as const,
        dateOfBirth: new Date("2018-03-10"),
        fatherName: "Peter Scholar",
        fatherPhone: "+254 712 555 555",
        motherName: "Diana Scholar",
        motherPhone: "+254 712 666 666",
      },
    ];

    let learnersAdded = 0;
    for (const learnerData of learnersToAdd) {
      let existingLearner;
      try {
        existingLearner = await prisma.learner.findFirst({
          where: {
            admissionNumber: learnerData.admissionNumber,
            schoolId: templateSchool.id,
          },
        });
      } catch {
        existingLearner = null;
      }

      if (existingLearner) {
        console.log(`⏭️  ${learnerData.admissionNumber} | ${learnerData.firstName} ${learnerData.lastName} (already exists)`);
        continue;
      }

      const learner = await prisma.learner.create({
        data: {
          admissionNumber: learnerData.admissionNumber,
          firstName: learnerData.firstName,
          lastName: learnerData.lastName,
          gender: learnerData.gender,
          dateOfBirth: learnerData.dateOfBirth,
          grade: "GRADE_1",
          schoolId: templateSchool.id,
          branchId: mainCampus.id,
          fatherName: learnerData.fatherName,
          fatherPhone: learnerData.fatherPhone,
          motherName: learnerData.motherName,
          motherPhone: learnerData.motherPhone,
          status: "ACTIVE",
        },
      });

      // Enroll in class
      await prisma.classEnrollment.create({
        data: {
          classId: grade1a.id,
          learnerId: learner.id,
          enrolledAt: new Date(),
          active: true,
        },
      });

      console.log(`✅ ${learnerData.admissionNumber} | ${learnerData.firstName} ${learnerData.lastName}`);
      learnersAdded++;
    }

    console.log(`\n📊 Added ${learnersAdded} new learners\n`);

    // Final verification
    const finalUsers = await prisma.user.count({
      where: { schoolId: templateSchool.id },
    });

    const finalLearners = await prisma.learner.count({
      where: { schoolId: templateSchool.id },
    });

    console.log("✅ SYNC COMPLETE!\n");
    console.log("🎯 PRODUCTION STATUS:");
    console.log(`   - Template School: EDucore Template`);
    console.log(`   - Total Users: ${finalUsers}`);
    console.log(`   - Total Learners: ${finalLearners}`);
    console.log(`\n🚀 All users can now login to PRODUCTION as well!`);
  } catch (error: any) {
    console.error("❌ Error syncing data:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncTemplateUsers();
