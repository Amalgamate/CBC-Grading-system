import { PrismaClient, UserRole, UserStatus, AdmissionFormatType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedFeeTypes } from './seed-fee-types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('\n🏫 Ensuring EDucore Template school exists...');
  console.log('\n🏫 Ensuring EDucore Template school exists...');
  const templateSchoolData = {
    name: 'EDucore Template',
    registrationNo: 'EDUCORE-TEMPLATE-001',
    address: 'Nairobi, Kenya',
    county: 'Nairobi',
    subCounty: 'Westlands',
    phone: '+254712345000',
    email: 'template@educore.local',
    principalName: 'Template Principal',
    principalPhone: '+254712345010',
    active: true,
    status: 'TEMPLATE',
    admissionFormatType: AdmissionFormatType.BRANCH_PREFIX_START,
    branchSeparator: '-'
  };

  // Try find by name first
  let templateSchool = await prisma.school.findFirst({
    where: { name: 'EDucore Template' }
  });

  // If not found by name, try find by registration number
  if (!templateSchool) {
    templateSchool = await prisma.school.findFirst({
      where: { registrationNo: 'EDUCORE-TEMPLATE-001' }
    });
  }

  if (!templateSchool) {
    templateSchool = await prisma.school.create({
      data: templateSchoolData
    });
    console.log(`   ✅ Created template school: ${templateSchool.name} (ID: ${templateSchool.id})`);
  } else {
    // Optional: Update details if needed, or just log existence
    console.log(`   ℹ️  Template school already exists: ${templateSchool.name} (ID: ${templateSchool.id})`);
  }

  let templateBranch: any | null = null;

  if (templateSchool) {
    templateBranch = await prisma.branch.findFirst({
      where: { schoolId: templateSchool.id, code: 'TPL' }
    });

    if (!templateBranch) {
      templateBranch = await prisma.branch.create({
        data: {
          schoolId: templateSchool.id,
          name: 'Template Campus',
          code: 'TPL',
          address: templateSchool.address,
          phone: templateSchool.phone,
          email: templateSchool.email,
          principalName: templateSchool.principalName,
          active: true
        }
      });

      console.log(`   ✅ Created template branch: ${templateBranch.name} (Code: ${templateBranch.code})`);
    } else {
      console.log(`   ℹ️  Template branch already exists: ${templateBranch.name} (Code: ${templateBranch.code})`);
    }
  }

  const users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string;
  }> = [
      {
        email: 'superadmin@local.test',
        password: process.env.SUPER_ADMIN_PASSWORD || 'ChangeMeNow123!',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        phone: '+254713612141'
      },
      {
        email: 'admin@local.test',
        password: 'Admin123!',
        firstName: 'School',
        lastName: 'Admin',
        role: 'ADMIN',
        phone: '+254712345002'
      },
      {
        email: 'headteacher@local.test',
        password: 'HeadTeacher123!',
        firstName: 'Head',
        lastName: 'Teacher',
        role: 'HEAD_TEACHER',
        phone: '+254712345003'
      },
      {
        email: 'teacher@local.test',
        password: 'Teacher123!',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'TEACHER',
        phone: '+254712345004'
      },
      {
        email: 'parent@local.test',
        password: 'Parent123!',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'PARENT',
        phone: '+254712345005'
      },
      {
        email: 'accountant@local.test',
        password: 'Accountant123!',
        firstName: 'Finance',
        lastName: 'Officer',
        role: 'ACCOUNTANT',
        phone: '+254712345006'
      },
      {
        email: 'receptionist@local.test',
        password: 'Receptionist123!',
        firstName: 'Front',
        lastName: 'Desk',
        role: 'RECEPTIONIST',
        phone: '+254712345007'
      }
    ];

  console.log('👥 Creating development users...');

  for (const userData of users) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        if (templateSchool && !existingUser.schoolId && existingUser.role !== 'SUPER_ADMIN') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              schoolId: templateSchool.id,
              branchId: templateBranch ? templateBranch.id : null
            }
          });

          console.log(
            `   🔄 Updated ${existingUser.role}: ${existingUser.email} with template school and branch assignment`
          );
        } else {
          console.log(`   ⏭️  User ${userData.email} already exists, skipping...`);
        }

        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          status: 'ACTIVE' as UserStatus,
          emailVerified: true,
          schoolId:
            userData.role === 'SUPER_ADMIN' || !templateSchool ? null : templateSchool.id,
          branchId:
            userData.role === 'SUPER_ADMIN' || !templateBranch ? null : templateBranch.id
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      console.log(`   ✅ Created ${user.role}: ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Error creating ${userData.email}:`, errorMessage);
    }
  }

  // Create default subscription plans if none exist
  console.log('\n💳 Checking for subscription plans...');
  const planCount = await prisma.subscriptionPlan.count();

  if (planCount === 0) {
    console.log('   📝 Creating default subscription plans...');

    const plans = [
      {
        name: 'Starter',
        maxBranches: 1,
        modules: {
          ASSESSMENT: true,
          LEARNERS: true,
          TUTORS: true,
          PARENTS: true,
          ATTENDANCE: true,
          FEES: true,
          REPORTS: true,
          SECURITY: false,
          LIBRARY: false,
          TRANSPORT: false,
          HEALTH: false,
          SETTINGS: true
        },
        isActive: true
      },
      {
        name: 'Professional',
        maxBranches: 3,
        modules: {
          ASSESSMENT: true,
          LEARNERS: true,
          TUTORS: true,
          PARENTS: true,
          ATTENDANCE: true,
          FEES: true,
          REPORTS: true,
          SECURITY: true,
          LIBRARY: true,
          TRANSPORT: true,
          HEALTH: true,
          SETTINGS: true
        },
        isActive: true
      },
      {
        name: 'Enterprise',
        maxBranches: 999,
        modules: {
          ASSESSMENT: true,
          LEARNERS: true,
          TUTORS: true,
          PARENTS: true,
          ATTENDANCE: true,
          FEES: true,
          REPORTS: true,
          SECURITY: true,
          LIBRARY: true,
          TRANSPORT: true,
          HEALTH: true,
          SETTINGS: true
        },
        isActive: true
      }
    ];

    for (const planData of plans) {
      try {
        const plan = await prisma.subscriptionPlan.create({
          data: planData
        });
        console.log(`   ✅ Created plan: ${plan.name} (Max branches: ${plan.maxBranches})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Error creating plan ${planData.name}:`, errorMessage);
      }
    }
  } else {
    console.log(`   ℹ️  ${planCount} subscription plan(s) already exist, skipping...`);
  }

  // Seed streams for all schools
  console.log('\n📚 Seeding streams A-D...');
  const schools = await prisma.school.findMany({ where: { active: true } });

  if (schools.length > 0) {
    const streamNames = ['A', 'B', 'C', 'D'];

    for (const school of schools) {
      console.log(`   📝 Creating streams for ${school.name}...`);

      for (const streamName of streamNames) {
        try {
          // Check if stream already exists
          const existingStream = await prisma.streamConfig.findFirst({
            where: {
              schoolId: school.id,
              name: streamName
            }
          });

          if (existingStream) {
            console.log(`      ⏭️  Stream ${streamName} already exists, skipping...`);
            continue;
          }

          // Create the stream
          const stream = await prisma.streamConfig.create({
            data: {
              schoolId: school.id,
              name: streamName,
              active: true
            }
          });

          console.log(`      ✅ Created stream: ${stream.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`      ❌ Error creating stream ${streamName}:`, errorMessage);
        }
      }
    }
  } else {
    console.log('   ⚠️  No active schools found, skipping stream seeding');
  }

  // Seed fee types
  await seedFeeTypes(prisma);

  console.log('\n✨ Database seed completed!');
  console.log('\n📋 Development User Credentials:');
  console.log('━'.repeat(60));
  users.forEach(user => {
    console.log(`   ${user.role.padEnd(20)} | ${user.email.padEnd(25)} | ${user.password}`);
  });
  console.log('━'.repeat(60));
  console.log('\n💡 Use these credentials to log in to the application.');
  console.log('⚠️  Remember to change the SUPER_ADMIN password in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
