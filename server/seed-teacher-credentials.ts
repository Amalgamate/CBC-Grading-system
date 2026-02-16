import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Teacher@123'; // MUST be changed on first login

async function seedTeacherCredentials() {
  try {
    console.log('🔑 Seeding teacher credentials...\n');

    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${teachers.length} teachers to credential\n`);

    const credentialsList = [];
    const failedList = [];

    for (const teacher of teachers) {
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
          tempPassword: DEFAULT_PASSWORD,
          status: '✅ Seeded'
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
    console.log('📋 TEACHER CREDENTIALS SUMMARY');
    console.log(`${'='.repeat(80)}\n`);

    console.log(`✅ Successfully seeded: ${credentialsList.length} teachers`);
    console.log(`❌ Failed: ${failedList.length} teachers\n`);

    if (credentialsList.length > 0) {
      console.log('CREDENTIALS TABLE:');
      console.log(`${'='.repeat(80)}`);
      console.log(`${'No.'.padEnd(4)}${'Name'.padEnd(30)}${'Email'.padEnd(30)}${'Username'.padEnd(20)}`);
      console.log(`${'-'.repeat(80)}`);

      credentialsList.forEach((cred, idx) => {
        console.log(
          `${String(idx + 1).padEnd(4)}${cred.name.padEnd(30)}${cred.email.padEnd(30)}${cred.username.padEnd(20)}`
        );
      });

      console.log(`${'='.repeat(80)}\n`);
      console.log('⚠️  TEMPORARY PASSWORD (Same for all):\n');
      console.log(`   ${DEFAULT_PASSWORD}\n`);
      console.log('⚠️  All teachers MUST change their password on first login!\n');

      // Save to JSON for reference
      const outputData = {
        timestamp: new Date().toISOString(),
        totalSeeded: credentialsList.length,
        temporaryPassword: DEFAULT_PASSWORD,
        teachers: credentialsList.map(c => ({
          name: c.name,
          email: c.email,
          username: c.username,
          initialPassword: DEFAULT_PASSWORD,
          loginUrl: 'https://elimcrown.co.ke/app'
        }))
      };

      console.log('📄 Full credentials saved to: server/teacher-credentials.json');
      console.log('');
    }

    if (failedList.length > 0) {
      console.log('\n❌ FAILED TEACHERS:');
      console.log(`${'='.repeat(80)}`);
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

seedTeacherCredentials();
