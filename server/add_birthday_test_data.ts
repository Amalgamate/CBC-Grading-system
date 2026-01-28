/**
 * Script to Add Test Students with Birthdays This Week
 * 
 * This script adds 3 students with birthdays spread across the current week
 * so we can test the birthday notifier functionality.
 * 
 * Run this from the server directory:
 * npx ts-node add_birthday_test_data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBirthdayTestData() {
  console.log('🎂 Adding Test Students with Birthdays This Week\n');
  console.log('='.repeat(60));

  try {
    // Get today's date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Calculate birthday dates for this week
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);

    const in6Days = new Date(today);
    in6Days.setDate(today.getDate() + 6);

    // Create birthday dates from past years (students should be 8-15 years old)
    const birthday1 = new Date(currentYear - 10, tomorrow.getMonth(), tomorrow.getDate());
    const birthday2 = new Date(currentYear - 12, in3Days.getMonth(), in3Days.getDate());
    const birthday3 = new Date(currentYear - 9, in6Days.getMonth(), in6Days.getDate());

    console.log('\n📅 Birthday Dates to be Added:');
    console.log(`   1. Tomorrow: ${birthday1.toLocaleDateString()} (Turning 10)`);
    console.log(`   2. In 3 days: ${birthday2.toLocaleDateString()} (Turning 12)`);
    console.log(`   3. In 6 days: ${birthday3.toLocaleDateString()} (Turning 9)`);

    // First, get an active school and branch
    const school = await prisma.school.findFirst({
      where: { active: true },
      include: { branches: true }
    });

    if (!school) {
      console.error('\n❌ No active school found. Please create a school first.');
      return;
    }

    const branch = school.branches[0];
    if (!branch) {
      console.error('\n❌ No branch found for school. Please create a branch first.');
      return;
    }

    console.log(`\n🏫 Using School: ${school.name}`);
    console.log(`🏢 Using Branch: ${branch.name}`);

    // Test students data
    const testStudents = [
      {
        admissionNumber: 'BDAY-TEST-001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: birthday1,
        gender: 'FEMALE' as const,
        grade: 'GRADE_5' as const,
        stream: 'A',
        turningAge: 10,
        daysUntil: 1
      },
      {
        admissionNumber: 'BDAY-TEST-002',
        firstName: 'Michael',
        lastName: 'Brown',
        dateOfBirth: birthday2,
        gender: 'MALE' as const,
        grade: 'GRADE_6' as const,
        stream: 'B',
        turningAge: 12,
        daysUntil: 3
      },
      {
        admissionNumber: 'BDAY-TEST-003',
        firstName: 'Emma',
        lastName: 'Davis',
        dateOfBirth: birthday3,
        gender: 'FEMALE' as const,
        grade: 'GRADE_4' as const,
        stream: 'A',
        turningAge: 9,
        daysUntil: 6
      }
    ];

    console.log('\n🔄 Creating/Updating Test Students...\n');

    const results = [];

    for (const student of testStudents) {
      // Check if student already exists
      const existing = await prisma.learner.findUnique({
        where: {
          schoolId_admissionNumber: {
            schoolId: school.id,
            admissionNumber: student.admissionNumber
          }
        }
      });

      let learner;

      if (existing) {
        // Update existing student
        learner = await prisma.learner.update({
          where: { id: existing.id },
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            grade: student.grade,
            stream: student.stream,
            status: 'ACTIVE'
          }
        });
        console.log(`✅ Updated: ${student.firstName} ${student.lastName}`);
      } else {
        // Create new student
        learner = await prisma.learner.create({
          data: {
            schoolId: school.id,
            branchId: branch.id,
            admissionNumber: student.admissionNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            grade: student.grade,
            stream: student.stream,
            status: 'ACTIVE',
            guardianName: `${student.firstName}'s Parent`,
            guardianPhone: '0700000000'
          }
        });
        console.log(`✨ Created: ${student.firstName} ${student.lastName}`);
      }

      results.push({
        name: `${student.firstName} ${student.lastName}`,
        admNo: student.admissionNumber,
        grade: student.grade,
        dob: student.dateOfBirth.toLocaleDateString(),
        turningAge: student.turningAge,
        daysUntil: student.daysUntil
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Test students added/updated.\n');

    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    results.forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.name}`);
      console.log(`   Admission No: ${r.admNo}`);
      console.log(`   Grade: ${r.grade}`);
      console.log(`   Date of Birth: ${r.dob}`);
      console.log(`   Turning: ${r.turningAge} years old`);
      console.log(`   Birthday in: ${r.daysUntil} day(s)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Next Steps:');
    console.log('   1. Start your backend server (npm run dev)');
    console.log('   2. Test the birthday API endpoint:');
    console.log('      GET /api/learners/birthdays/upcoming');
    console.log('   3. Or run: node test_birthdays.js');
    console.log('\n🎉 Happy Testing!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addBirthdayTestData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
