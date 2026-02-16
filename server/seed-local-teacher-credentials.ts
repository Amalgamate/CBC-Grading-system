import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Teacher@123';

async function seedLocalTeacherCredentials() {
  try {
    console.log('🔑 Seeding LOCAL database with teacher credentials...\n');

    // Find ZAWADI school in local database
    const zawadi = await prisma.school.findUnique({
      where: {
        name: 'ZAWADI JUNIOR ACADEMY'
      }
    });

    if (!zawadi) {
      console.log('❌ ZAWADI JUNIOR ACADEMY not found in local database');
      console.log('Creating the school first...\n');
      
      const createdSchool = await prisma.school.create({
        data: {
          name: 'ZAWADI JUNIOR ACADEMY',
          county: 'Nairobi',
          phone: '+254 713 612 141',
          email: 'info@zawadi.ac.ke',
          principalName: 'Rico kariuki',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Created school:', createdSchool.name);
      var schoolId = createdSchool.id;
    } else {
      console.log('✅ Found ZAWADI JUNIOR ACADEMY in local database\n');
      var schoolId = zawadi.id;
    }

    // Get all teachers from local database for ZAWADI
    const localTeachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        schoolId: schoolId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📚 Found ${localTeachers.length} teachers in ZAWADI school\n`);

    if (localTeachers.length === 0) {
      console.log('⚠️  No teachers found in local ZAWADI school');
      console.log('You may need to seed the teachers first.\n');
      return;
    }

    const credentialsList = [];
    const failedList = [];

    for (const teacher of localTeachers) {
      try {
        // Generate username from first and last name
        const fname = teacher.firstName.toLowerCase().replace(/\s+/g, '');
        const lname = teacher.lastName.toLowerCase().replace(/\s+/g, '');
        const generatedUsername = `${fname}.${lname}`.substring(0, 30);

        // Hash the password
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // Update teacher with username and hashed password
        const updatedTeacher = await prisma.user.update({
          where: { id: teacher.id },
          data: {
            username: generatedUsername,
            password: hashedPassword,
            status: 'ACTIVE'
          }
        });

        credentialsList.push({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          username: generatedUsername,
          tempPassword: DEFAULT_PASSWORD
        });

        console.log(`✅ ${updatedTeacher.firstName} ${updatedTeacher.lastName} → ${generatedUsername}`);
      } catch (error) {
        console.error(`❌ Failed for ${teacher.firstName} ${teacher.lastName}:`, error instanceof Error ? error.message : String(error));
        failedList.push({
          name: `${teacher.firstName} ${teacher.lastName}`,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('📋 LOCAL DATABASE SEEDING SUMMARY');
    console.log(`${'='.repeat(80)}\n`);

    console.log(`✅ Successfully seeded: ${credentialsList.length} teachers`);
    console.log(`❌ Failed: ${failedList.length} teachers\n`);

    if (credentialsList.length > 0) {
      console.log('CREDENTIALS SEEDED:');
      console.log(`${'='.repeat(80)}`);
      
      credentialsList.forEach((cred, idx) => {
        console.log(`${idx + 1}. ${cred.name}`);
        console.log(`   Email: ${cred.email}`);
        console.log(`   Username: ${cred.username}`);
      });

      console.log(`${'='.repeat(80)}\n`);
      console.log(`✅ All teachers in LOCAL database are now ready to login!`);
      console.log(`\n⚠️  Temporary Password (all teachers): ${DEFAULT_PASSWORD}\n`);
    }

    if (failedList.length > 0) {
      console.log('\n❌ FAILED:');
      failedList.forEach(failed => {
        console.log(`${failed.name}: ${failed.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLocalTeacherCredentials();
