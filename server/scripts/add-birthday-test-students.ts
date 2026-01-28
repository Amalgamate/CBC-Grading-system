/**
 * Quick script to add 3 test students with birthdays this week
 * Run: npx ts-node scripts/add-birthday-test-students.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎂 Adding Birthday Test Students...\n');

  try {
    // Get active school and branch
    const school = await prisma.school.findFirst({
      where: { active: true },
      include: { branches: true }
    });

    if (!school || !school.branches[0]) {
      console.error('❌ No active school/branch found!');
      return;
    }

    const branch = school.branches[0];
    console.log(`🏫 School: ${school.name}`);
    console.log(`🏢 Branch: ${branch.name}\n`);

    // Calculate dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    
    const in6Days = new Date(today);
    in6Days.setDate(today.getDate() + 6);

    // Create birthdays (10, 12, 9 years ago)
    const bd1 = new Date(today.getFullYear() - 10, tomorrow.getMonth(), tomorrow.getDate());
    const bd2 = new Date(today.getFullYear() - 12, in3Days.getMonth(), in3Days.getDate());
    const bd3 = new Date(today.getFullYear() - 9, in6Days.getMonth(), in6Days.getDate());

    const students = [
      { admNo: 'BDAY-TEST-001', fname: 'Sarah', lname: 'Johnson', dob: bd1, gender: 'FEMALE', grade: 'GRADE_5', stream: 'A' },
      { admNo: 'BDAY-TEST-002', fname: 'Michael', lname: 'Brown', dob: bd2, gender: 'MALE', grade: 'GRADE_6', stream: 'B' },
      { admNo: 'BDAY-TEST-003', fname: 'Emma', lname: 'Davis', dob: bd3, gender: 'FEMALE', grade: 'GRADE_4', stream: 'A' }
    ];

    for (const s of students) {
      const existing = await prisma.learner.findUnique({
        where: { schoolId_admissionNumber: { schoolId: school.id, admissionNumber: s.admNo } }
      });

      if (existing) {
        await prisma.learner.update({
          where: { id: existing.id },
          data: { firstName: s.fname, lastName: s.lname, dateOfBirth: s.dob, gender: s.gender as any, grade: s.grade as any, stream: s.stream, status: 'ACTIVE' }
        });
        console.log(`✅ Updated: ${s.fname} ${s.lname}`);
      } else {
        await prisma.learner.create({
          data: {
            schoolId: school.id,
            branchId: branch.id,
            admissionNumber: s.admNo,
            firstName: s.fname,
            lastName: s.lname,
            dateOfBirth: s.dob,
            gender: s.gender as any,
            grade: s.grade as any,
            stream: s.stream,
            status: 'ACTIVE',
            guardianName: `${s.fname}'s Parent`,
            guardianPhone: '0700000000'
          }
        });
        console.log(`✨ Created: ${s.fname} ${s.lname}`);
      }
    }

    console.log('\n✅ Done! 3 students added with birthdays this week.');
    console.log('\n📅 Test with: GET /api/learners/birthdays/upcoming\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
