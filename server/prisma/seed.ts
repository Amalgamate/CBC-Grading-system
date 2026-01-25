import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default seeded users for development
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
      phone: '+254712345001'
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
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`   ⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          status: 'ACTIVE' as UserStatus,
          emailVerified: true
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

  // Create a default school if none exists
  console.log('\n🏫 Checking for default school...');
  const schoolCount = await prisma.school.count();
  
  if (schoolCount === 0) {
    console.log('   📝 Creating default school...');
    
    const school = await prisma.school.create({
      data: {
        name: 'Zawadi JRN Academy',
        registrationNo: 'ZJRN-2025-001',
        address: 'Nairobi, Kenya',
        county: 'Nairobi',
        subCounty: 'Westlands',
        phone: '+254712345000',
        email: 'info@zawadijrn.ac.ke',
        principalName: 'Principal Name',
        principalPhone: '+254712345010',
        active: true,
        admissionFormatType: 'BRANCH_PREFIX_START',
        branchSeparator: '-'
      }
    });

    console.log(`   ✅ Created school: ${school.name} (ID: ${school.id})`);

    // Create a default branch for the school
    console.log('   📝 Creating default branch...');
    const branch = await prisma.branch.create({
      data: {
        schoolId: school.id,
        name: 'Main Campus',
        code: 'MC',
        address: 'Nairobi, Kenya',
        phone: '+254712345000',
        email: 'main@zawadijrn.ac.ke',
        principalName: 'Campus Principal',
        active: true
      }
    });

    console.log(`   ✅ Created branch: ${branch.name} (Code: ${branch.code})`);
  } else {
    console.log(`   ℹ️  ${schoolCount} school(s) already exist, skipping...`);
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
