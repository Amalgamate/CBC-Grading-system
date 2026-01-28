/**
 * Quick diagnostic script to check birthday data
 * Run: npx ts-node check-birthdays.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBirthdays() {
  console.log('🔍 Checking Birthday Data...\n');
  console.log('='.repeat(60));

  try {
    // 1. Check if we have any schools
    const schoolCount = await prisma.school.count();
    console.log(`\n📊 Total Schools: ${schoolCount}`);

    const activeSchools = await prisma.school.findMany({
      where: { active: true },
      select: { id: true, name: true }
    });
    console.log(`✅ Active Schools: ${activeSchools.length}`);
    activeSchools.forEach(s => console.log(`   - ${s.name} (${s.id})`));

    if (activeSchools.length === 0) {
      console.log('\n❌ No active schools found!');
      return;
    }

    // 2. Check total learners
    const totalLearners = await prisma.learner.count();
    console.log(`\n📚 Total Learners: ${totalLearners}`);

    // 3. Check test students
    const testStudents = await prisma.learner.findMany({
      where: {
        admissionNumber: {
          startsWith: 'BDAY-TEST-'
        }
      },
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        grade: true,
        stream: true,
        status: true,
        archived: true,
        schoolId: true
      }
    });

    console.log(`\n🎂 Test Birthday Students: ${testStudents.length}`);
    if (testStudents.length > 0) {
      testStudents.forEach(s => {
        const age = new Date().getFullYear() - new Date(s.dateOfBirth).getFullYear();
        console.log(`\n   ✓ ${s.firstName} ${s.lastName}`);
        console.log(`     Admission: ${s.admissionNumber}`);
        console.log(`     DOB: ${s.dateOfBirth.toLocaleDateString()}`);
        console.log(`     Age: ${age}`);
        console.log(`     Grade: ${s.grade} - ${s.stream}`);
        console.log(`     Status: ${s.status}`);
        console.log(`     Archived: ${s.archived}`);
      });
    } else {
      console.log('   ❌ No test students found!');
      console.log('   Run: npx ts-node add_birthday_test_data.ts');
    }

    // 4. Check all active learners with DOB
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const allActiveLearners = await prisma.learner.findMany({
      where: {
        status: 'ACTIVE',
        archived: false,
        dateOfBirth: { not: null as any }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        admissionNumber: true
      }
    });

    console.log(`\n👥 Active Learners with DOB: ${allActiveLearners.length}`);

    // 5. Calculate upcoming birthdays manually
    const upcoming = allActiveLearners.filter(l => {
      if (!l.dateOfBirth) return false;

      const dob = new Date(l.dateOfBirth);
      const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Birthday this year
      const bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      // Birthday next year (for Dec to Jan transition)
      const bdayNextYear = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());

      return (bdayThisYear >= todayNorm && bdayThisYear <= nextWeek) ||
             (bdayNextYear >= todayNorm && bdayNextYear <= nextWeek);
    });

    console.log(`\n🎉 Birthdays in Next 7 Days: ${upcoming.length}`);
    if (upcoming.length > 0) {
      upcoming.forEach(l => {
        const dob = new Date(l.dateOfBirth!);
        let bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (bday < today) {
          bday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }
        const daysUntil = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`\n   🎂 ${l.firstName} ${l.lastName}`);
        console.log(`      Admission: ${l.admissionNumber}`);
        console.log(`      Birthday: ${bday.toLocaleDateString()}`);
        console.log(`      In: ${daysUntil} day(s)`);
      });
    } else {
      console.log('   ℹ️  No birthdays found in the next 7 days');
    }

    // 6. Show date range being checked
    console.log('\n📅 Date Range:');
    console.log(`   Today: ${today.toLocaleDateString()}`);
    console.log(`   Next Week: ${nextWeek.toLocaleDateString()}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic Complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkBirthdays();
