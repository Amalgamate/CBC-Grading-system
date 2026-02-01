/**
 * Seed Classes Script
 * Seeds all grades with all streams (A-D) in a given stream for active schools
 * 
 * Usage: 
 *   npx ts-node prisma/seed-classes.ts
 * Or:
 *   npm run seed:classes
 * 
 * This script creates one class for each grade in stream A by default
 * You can modify STREAM_NAME or STREAMS array to create multiple streams
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const STREAMS = ['A']; // Create classes for only Stream A
const ACADEMIC_YEAR = 2025;
const CURRENT_TERM = 'TERM_1';
const CLASS_CAPACITY = 40;

// All available grades in order
const GRADES = [
  'CRECHE',
  'RECEPTION',
  'TRANSITION',
  'PLAYGROUP',
  'PP1',
  'PP2',
  'GRADE_1',
  'GRADE_2',
  'GRADE_3',
  'GRADE_4',
  'GRADE_5',
  'GRADE_6',
  'GRADE_7',
  'GRADE_8',
  'GRADE_9',
  'GRADE_10',
  'GRADE_11',
  'GRADE_12'
];

// Grade name mappings for display
const GRADE_DISPLAY_NAMES: Record<string, string> = {
  'CRECHE': 'Creche',
  'RECEPTION': 'Reception',
  'TRANSITION': 'Transition',
  'PLAYGROUP': 'Playgroup',
  'PP1': 'PP1',
  'PP2': 'PP2',
  'GRADE_1': 'Grade 1',
  'GRADE_2': 'Grade 2',
  'GRADE_3': 'Grade 3',
  'GRADE_4': 'Grade 4',
  'GRADE_5': 'Grade 5',
  'GRADE_6': 'Grade 6',
  'GRADE_7': 'Grade 7',
  'GRADE_8': 'Grade 8',
  'GRADE_9': 'Grade 9',
  'GRADE_10': 'Grade 10',
  'GRADE_11': 'Grade 11',
  'GRADE_12': 'Grade 12'
};

async function seedClasses() {
  console.log('🌱 Starting classes seed...\n');
  console.log(`📋 Configuration:`);
  console.log(`   Streams: ${STREAMS.join(', ')}`);
  console.log(`   Academic Year: ${ACADEMIC_YEAR}`);
  console.log(`   Term: ${CURRENT_TERM}`);
  console.log(`   Class Capacity: ${CLASS_CAPACITY}`);
  console.log(`   Total Grades: ${GRADES.length}`);
  console.log(`   Classes to Create: ${GRADES.length * STREAMS.length} per branch\n`);
  console.log('━'.repeat(70));

  try {
    // Get all active schools with their branches
    const schools = await prisma.school.findMany({
      where: { active: true },
      include: {
        branches: {
          where: { active: true }
        }
      }
    });

    if (schools.length === 0) {
      console.log('⚠️  No active schools found in database.');
      console.log('   Please create a school first before seeding classes.\n');
      return;
    }

    console.log(`\n📚 Found ${schools.length} active school(s)\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each school
    for (const school of schools) {
      console.log(`\n🏫 School: ${school.name}`);
      console.log(`   School ID: ${school.id}`);

      // Get branches for this school
      const branches = await prisma.branch.findMany({
        where: { schoolId: school.id, active: true }
      });

      if (branches.length === 0) {
        console.log(`   ⚠️  No active branches found. Skipping...\n`);
        continue;
      }

      console.log(`   📍 Found ${branches.length} branch(es)\n`);

      // Process each branch
      for (const branch of branches) {
        console.log(`   📌 Branch: ${branch.name} (${branch.code})`);

        let branchClassesCreated = 0;
        let branchClassesSkipped = 0;
        let branchErrors = 0;

        // Create classes for each grade and stream combination
        for (const grade of GRADES) {
          for (const stream of STREAMS) {
            try {
              // Generate class name
              const gradeName = GRADE_DISPLAY_NAMES[grade];
              const className = `${gradeName} ${stream}`;

              // Check if class already exists
              const existingClass = await prisma.class.findUnique({
                where: {
                  branchId_grade_stream_academicYear_term: {
                    branchId: branch.id,
                    grade: grade as any,
                    stream: stream,
                    academicYear: ACADEMIC_YEAR,
                    term: CURRENT_TERM as any
                  }
                }
              });

              if (existingClass) {
                console.log(`      ⏭️  ${className} already exists (ID: ${existingClass.id})`);
                branchClassesSkipped++;
                totalSkipped++;
                continue;
              }

              // Create the class
              const newClass = await prisma.class.create({
                data: {
                  branchId: branch.id,
                  name: className,
                  grade: grade as any,
                  stream: stream,
                  academicYear: ACADEMIC_YEAR,
                  term: CURRENT_TERM as any,
                  capacity: CLASS_CAPACITY,
                  active: true,
                  archived: false
                }
              });

              console.log(`      ✅ Created: ${className} (ID: ${newClass.id})`);
              branchClassesCreated++;
              totalCreated++;

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error(`      ❌ Error creating class: ${errorMessage}`);
              branchErrors++;
              totalErrors++;
            }
          }
        }

        // Branch summary
        console.log(`\n      📊 Branch Summary:`);
        console.log(`         Created: ${branchClassesCreated}`);
        console.log(`         Skipped: ${branchClassesSkipped}`);
        if (branchErrors > 0) {
          console.log(`         Errors: ${branchErrors}`);
        }
        console.log('');
      }
    }

    // Final summary
    console.log('\n' + '━'.repeat(70));
    console.log('📊 FINAL SUMMARY:');
    console.log('━'.repeat(70));
    console.log(`   Schools processed: ${schools.length}`);
    console.log(`   Total classes created: ${totalCreated}`);
    console.log(`   Total classes skipped (already exist): ${totalSkipped}`);
    if (totalErrors > 0) {
      console.log(`   Total errors: ${totalErrors}`);
    }
    console.log('━'.repeat(70));

    // Show current class state
    console.log('\n📋 Current Classes in Database:');
    console.log('━'.repeat(70));

    for (const school of schools) {
      const classCount = await prisma.class.count({
        where: { branch: { schoolId: school.id } }
      });
      console.log(`${school.name}: ${classCount} classes`);

      // Show by branch
      const branches = await prisma.branch.findMany({
        where: { schoolId: school.id }
      });

      for (const branch of branches) {
        const branchClassCount = await prisma.class.count({
          where: { branchId: branch.id }
        });

        const classesGroupedByGrade = await prisma.class.groupBy({
          by: ['grade'],
          where: { branchId: branch.id },
          _count: true
        });

        console.log(`   └─ ${branch.name}: ${branchClassCount} classes`);
        
        for (const gradeGroup of classesGroupedByGrade) {
          const gradeName = GRADE_DISPLAY_NAMES[gradeGroup.grade as string] || gradeGroup.grade;
          console.log(`      └─ ${gradeName}: ${gradeGroup._count} stream(s)`);
        }
      }
    }

    console.log('━'.repeat(70));
    console.log('\n✨ Classes seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Critical error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedClasses().catch((error) => {
  console.error('🔥 Seeding failed:', error);
  process.exit(1);
});
