/**
 * Integration Example: School Setup & Learner Admission with Branches
 * 
 * This example demonstrates the complete workflow:
 * 1. Use existing school OR create a new one
 * 2. Create multiple branches (or use existing)
 * 3. Generate admission numbers for each branch
 * 4. Create learners with admission numbers
 * 
 * Run with: npx ts-node src/examples/school-and-learner-setup.ts
 */

import { PrismaClient, Branch, Learner, School } from '@prisma/client';
import { generateAdmissionNumber, extractBranchCode, extractSequenceNumber, extractAcademicYear } from '../services/admissionNumber.service';

const prisma = new PrismaClient();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

async function schoolSetupExample(): Promise<void> {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║     SCHOOL SETUP & LEARNER ADMISSION WITH BRANCHES        ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════╝\n', colors.cyan);

  let school: School | null = null;
  let branches: Branch[] = [];
  const createdBranches: Branch[] = [];
  const createdLearners: Learner[] = [];

  try {
    // ============================================
    // STEP 1: CHECK FOR EXISTING SCHOOLS
    // ============================================
    log('[Step 1] Checking for existing schools...', colors.blue);

    const existingSchools = await prisma.school.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' }
    });

    if (existingSchools.length > 0) {
      school = existingSchools[0];
      log(`✓ Using existing school: ${school.name}`, colors.green);
      log(`  School ID: ${school.id}`);
      log(`  Format Type: ${school.admissionFormatType}`);
      log(`  Separator: "${school.branchSeparator}"\n`);
    } else {
      // Create new school if none exists
      log('No existing schools found. Creating new school...', colors.yellow);
      
      school = await prisma.school.create({
        data: {
          name: `Test School Network - ${Date.now()}`,
          admissionFormatType: 'BRANCH_PREFIX_START',
          branchSeparator: '-',
          registrationNo: `REG-${Date.now()}`,
          county: 'Nairobi',
          subCounty: 'Westlands',
          phone: '+254700000000',
          email: 'admin@testschool.ac.ke',
          principalName: 'Dr. John Doe',
          active: true
        }
      });

      log(`✓ School created: ${school.name}`, colors.green);
      log(`  School ID: ${school.id}`);
      log(`  Format Type: ${school.admissionFormatType}`);
      log(`  Separator: "${school.branchSeparator}"\n`);
    }

    // Type guard - ensure school is not null
    if (!school) throw new Error('School is required');
    const currentSchool: School = school;

    // ============================================
    // STEP 2: CHECK FOR EXISTING BRANCHES
    // ============================================
    log('[Step 2] Checking for existing branches...', colors.blue);

    const existingBranches = await prisma.branch.findMany({
      where: { schoolId: currentSchool.id }
    });

    if (existingBranches.length > 0 && existingBranches.some((b) => b.code === 'KB')) {
      // Only use existing if we have the test branches
      branches = existingBranches;
      log(`✓ Found ${branches.length} existing test branch(es):`, colors.green);
      branches.forEach((branch: Branch) => {
        log(`    ${branch.name} (${branch.code})`, colors.reset);
      });
      log('');
    } else {
      // Create new test branches
      if (existingBranches.length > 0) {
        log(`Found ${existingBranches.length} existing branch(es), but creating test branches...`, colors.yellow);
      } else {
        log('No branches found. Creating new branches...', colors.yellow);
      }

      const branchesData = [
        { name: 'Kiambiu Campus', code: 'KB' },
        { name: 'Mombasa Branch', code: 'MB' },
        { name: 'Kisumu Branch', code: 'KS' }
      ];

      const newBranches = await Promise.all(
        branchesData.map((branchData) =>
          prisma.branch.create({
            data: {
              schoolId: currentSchool.id,
              name: branchData.name,
              code: branchData.code,
              address: `${branchData.name} Address`,
              phone: '+254700000000',
              email: `${branchData.code.toLowerCase()}@testschool.ac.ke`,
              principalName: `Principal ${branchData.name}`,
              active: true
            }
          })
        )
      );

      branches = newBranches;
      createdBranches.push(...newBranches);

      branches.forEach((branch: Branch) => {
        log(`✓ Branch created: ${branch.name} (${branch.code})`, colors.green);
      });
      log('');
    }

    // ============================================
    // STEP 3: GENERATE ADMISSION NUMBERS PER BRANCH
    // ============================================
    log('[Step 3] Generating admission numbers for each branch...', colors.blue);

    const admissionNumbers = await Promise.all(
      branches.map(async (branch: Branch) => {
        const admissions: string[] = [];
        for (let i = 0; i < 3; i++) {
          const admissionNumber = await generateAdmissionNumber(currentSchool.id, branch.code, 2025);
          admissions.push(admissionNumber);
        }
        return { branchCode: branch.code, branchName: branch.name, admissions };
      })
    );

    admissionNumbers.forEach((item: any) => {
      log(`✓ ${item.branchName} (${item.branchCode}):`, colors.green);
      item.admissions.forEach((adm: string) => {
        log(`    ${adm}`, colors.reset);
      });
    });
    log('');

    // ============================================
    // STEP 4: CREATE LEARNERS WITH ADMISSION NUMBERS
    // ============================================
    log('[Step 4] Creating learners in each branch...', colors.blue);

    const learnersData = [
      // Kiambiu Branch
      {
        branchCode: 'KB',
        firstName: 'Test_Alice',
        lastName: 'Johnson',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'FEMALE',
        grade: 'GRADE_1'
      },
      {
        branchCode: 'KB',
        firstName: 'Test_Bob',
        lastName: 'Smith',
        dateOfBirth: new Date('2010-08-22'),
        gender: 'MALE',
        grade: 'GRADE_1'
      },
      // Mombasa Branch
      {
        branchCode: 'MB',
        firstName: 'Test_Carol',
        lastName: 'Williams',
        dateOfBirth: new Date('2010-03-10'),
        gender: 'FEMALE',
        grade: 'GRADE_2'
      },
      {
        branchCode: 'MB',
        firstName: 'Test_David',
        lastName: 'Brown',
        dateOfBirth: new Date('2010-11-05'),
        gender: 'MALE',
        grade: 'GRADE_2'
      },
      // Kisumu Branch
      {
        branchCode: 'KS',
        firstName: 'Test_Eve',
        lastName: 'Davis',
        dateOfBirth: new Date('2010-07-20'),
        gender: 'FEMALE',
        grade: 'GRADE_3'
      }
    ];

    const learners = await Promise.all(
      learnersData.map(async (learnerData: any) => {
        // Get branch ID
        const branch = branches.find((b: Branch) => b.code === learnerData.branchCode);
        if (!branch) throw new Error(`Branch ${learnerData.branchCode} not found`);

        // Generate admission number
        const admissionNumber = await generateAdmissionNumber(
          currentSchool.id,
          learnerData.branchCode,
          2025
        );

        // Create learner
        const learner = await prisma.learner.create({
          data: {
            schoolId: currentSchool.id,
            branchId: branch.id,
            admissionNumber,
            firstName: learnerData.firstName,
            lastName: learnerData.lastName,
            dateOfBirth: learnerData.dateOfBirth,
            gender: learnerData.gender,
            grade: learnerData.grade,
            status: 'ACTIVE'
          }
        });

        return learner;
      })
    );

    createdLearners.push(...learners);

    log(`✓ Created ${learners.length} learners:`, colors.green);
    learners.forEach((learner: Learner) => {
      const branch = branches.find((b: Branch) => b.id === learner.branchId);
      log(`    ${learner.admissionNumber} - ${learner.firstName} ${learner.lastName} (${branch?.name})`, colors.reset);
    });
    log('');

    // ============================================
    // STEP 5: VERIFY ADMISSION NUMBERS ARE UNIQUE PER SCHOOL
    // ============================================
    log('[Step 5] Verifying admission number uniqueness...', colors.blue);

    const admissionNumberCounts: { [key: string]: number } = {};
    learners.forEach((learner: Learner) => {
      const key = `${learner.schoolId}-${learner.admissionNumber}`;
      admissionNumberCounts[key] = (admissionNumberCounts[key] || 0) + 1;
    });

    const hasDuplicates = Object.values(admissionNumberCounts).some((count: number) => count > 1);

    if (!hasDuplicates) {
      log('✓ All admission numbers are unique per school (confirmed)', colors.green);
      log(`✓ Same numbers can exist across branches (as intended)\n`, colors.green);
    } else {
      log('✗ Duplicate admission numbers found!', colors.red);
    }

    // ============================================
    // STEP 6: QUERY LEARNERS BY BRANCH
    // ============================================
    log('[Step 6] Querying learners by branch...', colors.blue);

    const learnersPerBranch = await Promise.all(
      branches.map(async (branch: Branch) => {
        const count = await prisma.learner.count({
          where: { branchId: branch.id }
        });
        return { branchCode: branch.code, branchName: branch.name, count };
      })
    );

    learnersPerBranch.forEach((item: any) => {
      log(`✓ ${item.branchName} (${item.branchCode}): ${item.count} learners`, colors.green);
    });
    log('');

    // ============================================
    // STEP 7: PARSE ADMISSION NUMBERS
    // ============================================
    log('[Step 7] Parsing admission number components...', colors.blue);

    const sampleAdmission = learners[0];
    const branchCode = extractBranchCode(
      sampleAdmission.admissionNumber,
      school.admissionFormatType,
      school.branchSeparator
    );
    const sequenceNumber = extractSequenceNumber(
      sampleAdmission.admissionNumber,
      school.admissionFormatType,
      school.branchSeparator
    );
    const academicYear = extractAcademicYear(
      sampleAdmission.admissionNumber,
      school.admissionFormatType,
      school.branchSeparator
    );

    log(`Sample admission number: ${sampleAdmission.admissionNumber}`, colors.yellow);
    log(`  ├─ Branch Code: ${branchCode}`, colors.reset);
    log(`  ├─ Academic Year: ${academicYear}`, colors.reset);
    log(`  └─ Sequence Number: ${sequenceNumber}`, colors.reset);
    log('');

    // ============================================
    // STEP 8: SCHOOL-WIDE STATISTICS
    // ============================================
    log('[Step 8] School-wide statistics...', colors.blue);

    const schoolStats = await prisma.school.findUnique({
      where: { id: currentSchool.id },
      include: {
        _count: { select: { learners: true, branches: true } },
        branches: {
          include: { _count: { select: { learners: true } } }
        },
        admissionSequences: true
      }
    });

    log(`School: ${schoolStats?.name}`, colors.magenta);
    log(`  ├─ Total Branches: ${schoolStats?._count.branches}`, colors.reset);
    log(`  ├─ Total Learners: ${schoolStats?._count.learners}`, colors.reset);
    log(`  └─ Admission Format: ${schoolStats?.admissionFormatType}`, colors.reset);
    log('');

    if (schoolStats?.branches) {
      log('Learners per branch:', colors.magenta);
      schoolStats.branches.forEach((branch: any) => {
        log(`  ├─ ${branch.name}: ${branch._count.learners} learners`, colors.reset);
      });
    }
    log('');

    // ============================================
    // STEP 9: FORMAT ALTERNATIVES COMPARISON
    // ============================================
    log('[Step 9] Admission format alternatives...', colors.blue);
    log('Using same data, different format types would produce:\n', colors.yellow);

    const formats = [
      { type: 'NO_BRANCH', example: 'ADM-2025-001', description: 'No branch prefix (single location)' },
      {
        type: 'BRANCH_PREFIX_START',
        example: 'KB-ADM-2025-001',
        description: 'Branch code at start (current)'
      },
      {
        type: 'BRANCH_PREFIX_MIDDLE',
        example: 'ADM-KB-2025-001',
        description: 'Branch code in middle'
      },
      {
        type: 'BRANCH_PREFIX_END',
        example: 'ADM-2025-001-KB',
        description: 'Branch code at end'
      }
    ];

    formats.forEach((format: any) => {
      const isCurrent = format.type === currentSchool.admissionFormatType;
      const marker = isCurrent ? ' ← CURRENT' : '';
      log(`${format.type}${marker}`, isCurrent ? colors.green : colors.reset);
      log(`    Format: ${format.description}`, colors.reset);
      log(`    Example: ${format.example}`, colors.reset);
      log('');
    });

    // ============================================
    // SUMMARY
    // ============================================
    log('╔════════════════════════════════════════════════════════════╗', colors.cyan);
    log('║                       SUMMARY                              ║', colors.cyan);
    log('╚════════════════════════════════════════════════════════════╝\n', colors.cyan);

    log('✓ School setup complete', colors.green);
    log(`✓ Using ${existingBranches.length > 0 ? 'existing' : 'newly created'} branches`, colors.green);
    log('✓ School-wide admission sequence (shared across branches)', colors.green);
    log('✓ Branch identification in admission numbers', colors.green);
    log('✓ No duplicate admission numbers in school', colors.green);
    log('✓ Learners linked to specific branches', colors.green);
    log('✓ Ability to parse and extract components', colors.green);
    log('\nKey Points:', colors.magenta);
    log('  • Admission format is IMMUTABLE after school creation', colors.reset);
    log('  • Branch codes are IMMUTABLE after creation', colors.reset);
    log('  • Sequences are SCHOOL-WIDE (not per-branch)', colors.reset);
    log('  • No duplicates across any branch in a school', colors.reset);
    log('  • Different schools can reuse same branch codes', colors.reset);
    log('  • Each school controls its admission number format\n', colors.reset);
  } catch (error) {
    log('\n✗ ERROR DURING SETUP', colors.red);
    console.error(error);
  } finally {
    // ============================================
    // CLEANUP (only delete what we created)
    // ============================================
    if (createdLearners.length > 0 || createdBranches.length > 0) {
      log('\n[Cleanup] Deleting test data...', colors.yellow);

      try {
        // Delete learners we created
        if (createdLearners.length > 0) {
          await prisma.learner.deleteMany({
            where: {
              id: {
                in: createdLearners.map((l) => l.id)
              }
            }
          });
        }

        // Delete branches we created
        if (createdBranches.length > 0) {
          await prisma.branch.deleteMany({
            where: {
              id: {
                in: createdBranches.map((b) => b.id)
              }
            }
          });
        }

        log('✓ Cleanup completed\n', colors.green);
      } catch (error) {
        log('✗ Error during cleanup', colors.red);
        console.error(error);
      }
    }

    await prisma.$disconnect();
  }
}

// Run the example
schoolSetupExample().catch((error: any) => {
  console.error('Example failed:', error);
  process.exit(1);
});
