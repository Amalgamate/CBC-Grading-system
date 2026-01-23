/**
 * Example: Creating a Learner with Admission Number
 * 
 * This file demonstrates how to integrate the new admission number
 * generation system when creating learners.
 */

import { PrismaClient } from '@prisma/client';
import { generateAdmissionNumber } from '../services/admissionNumber.service';

const prisma = new PrismaClient();

/**
 * Example 1: Simple Learner Creation with Auto-Generated Admission Number
 */
export async function createLearnerWithAdmissionNumber(
  schoolId: string,
  academicYear: number,
  learnerData: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    grade: string;
    [key: string]: any;
  }
) {
  try {
    // Step 1: Generate the admission number for this school
    const admissionNumber = await generateAdmissionNumber(schoolId, academicYear);

    // Step 2: Create the learner with the generated admission number
    const learner = await prisma.learner.create({
      data: {
        schoolId,
        admissionNumber,
        ...learnerData,
        admissionDate: new Date()
      }
    });

    console.log(`✓ Learner created: ${learner.firstName} ${learner.lastName}`);
    console.log(`✓ Admission Number: ${learner.admissionNumber}`);
    console.log(`✓ Learner ID: ${learner.id}`);

    return learner;
  } catch (error) {
    console.error('✗ Error creating learner:', error);
    throw error;
  }
}

/**
 * Example 2: Bulk Admission - Creating Multiple Learners
 */
export async function bulkAdmitLearners(
  schoolId: string,
  academicYear: number,
  learners: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    grade: string;
    [key: string]: any;
  }>
) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const learnerData of learners) {
    try {
      // Generate unique admission number for each learner
      const admissionNumber = await generateAdmissionNumber(schoolId, academicYear);

      // Create the learner
      const learner = await prisma.learner.create({
        data: {
          schoolId,
          admissionNumber,
          ...learnerData,
          admissionDate: new Date()
        }
      });

      console.log(
        `✓ ${learnerData.firstName} ${learnerData.lastName} - ${admissionNumber}`
      );
      results.successful++;
    } catch (error: any) {
      results.failed++;
      const errorMsg = `Failed to admit ${learnerData.firstName} ${learnerData.lastName}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`✗ ${errorMsg}`);
    }
  }

  console.log('\n=== Admission Summary ===');
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((err) => console.log(`  - ${err}`));
  }

  return results;
}

/**
 * Example 3: Query Learners by School and Admission Year
 */
export async function getLearnersBySchoolYear(
  schoolId: string,
  academicYear: number
) {
  try {
    const learners = await prisma.learner.findMany({
      where: {
        schoolId,
        admissionDate: {
          gte: new Date(`${academicYear}-01-01`),
          lt: new Date(`${academicYear + 1}-01-01`)
        }
      },
      orderBy: {
        admissionNumber: 'asc' // Sequential order
      },
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        grade: true,
        status: true,
        admissionDate: true
      }
    });

    return learners;
  } catch (error) {
    console.error('Error querying learners:', error);
    throw error;
  }
}

/**
 * Example 4: Verify Learner by Admission Number
 */
export async function findLearnerByAdmissionNumber(
  schoolId: string,
  admissionNumber: string
) {
  try {
    const learnerData = await prisma.learner.findFirst({
      where: {
        schoolId,
        admissionNumber
      }
    });

    if (!learnerData) {
      console.log('Learner not found');
      return null;
    }

    console.log(`Found: ${learnerData.firstName} ${learnerData.lastName}`);
    return learnerData;
  } catch (error) {
    console.error('Error finding learner:', error);
    throw error;
  }
}

/**
 * Example 5: Get School Statistics
 */
export async function getSchoolAdmissionStats(schoolId: string) {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        _count: {
          select: {
            learners: true
          }
        },
        admissionSequences: {
          orderBy: { academicYear: 'desc' },
          take: 5 // Last 5 years
        }
      }
    });

    if (!school) {
      throw new Error('School not found');
    }

    console.log(`\n=== ${school.name} - Admission Statistics ===`);
    console.log(`Total Learners: ${school._count.learners}`);
    console.log('\nRecent Years:');

    for (const seq of school.admissionSequences) {
      console.log(
        `  ${seq.academicYear}: ${seq.currentValue} learners admitted`
      );
    }

    return {
      totalLearners: school._count.learners,
      sequences: school.admissionSequences
    };
  } catch (error) {
    console.error('Error getting school stats:', error);
    throw error;
  }
}

/**
 * Example 6: Export Learners by School in CSV Format
 */
export async function exportSchoolLearnersList(
  schoolId: string
): Promise<string> {
  try {
    const learners = await prisma.learner.findMany({
      where: { schoolId },
      orderBy: [
        { admissionNumber: 'asc' }
      ],
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        grade: true,
        status: true,
        admissionDate: true
      }
    });

    // Create CSV header
    let csv = 'ID,Admission Number,First Name,Last Name,DOB,Gender,Grade,Status,Admission Date\n';

    // Add rows
    for (const learner of learners) {
      csv += `${learner.id},${learner.admissionNumber},${learner.firstName},${learner.lastName},${learner.dateOfBirth.toISOString().split('T')[0]},${learner.gender},${learner.grade},${learner.status},${learner.admissionDate.toISOString().split('T')[0]}\n`;
    }

    return csv;
  } catch (error) {
    console.error('Error exporting learners:', error);
    throw error;
  }
}

/**
 * Usage Example
 */
async function demonstrateUsage() {
  // Create sample learners
  const schoolId = 'your-school-id'; // Replace with actual school ID
  const academicYear = 2025;

  const sampleLearners = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: new Date('2010-05-15'),
      gender: 'FEMALE',
      grade: 'GRADE_1'
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: new Date('2010-08-22'),
      gender: 'MALE',
      grade: 'GRADE_1'
    },
    {
      firstName: 'Carol',
      lastName: 'Williams',
      dateOfBirth: new Date('2010-03-10'),
      gender: 'FEMALE',
      grade: 'GRADE_1'
    }
  ];

  console.log('=== Creating Individual Learner ===');
  await createLearnerWithAdmissionNumber(schoolId, academicYear, sampleLearners[0]);

  console.log('\n=== Bulk Admitting Learners ===');
  await bulkAdmitLearners(schoolId, academicYear, sampleLearners);

  console.log('\n=== Querying Learners by School Year ===');
  const learners = await getLearnersBySchoolYear(schoolId, academicYear);
  console.log(`Found ${learners.length} learners`);

  console.log('\n=== School Statistics ===');
  await getSchoolAdmissionStats(schoolId);

  console.log('\n=== Export to CSV ===');
  const csv = await exportSchoolLearnersList(schoolId);
  console.log('CSV generated (first 3 rows):');
  console.log(csv.split('\n').slice(0, 3).join('\n'));
}

// Uncomment to run examples
// demonstrateUsage().catch(console.error);

export default {
  createLearnerWithAdmissionNumber,
  bulkAdmitLearners,
  getLearnersBySchoolYear,
  findLearnerByAdmissionNumber,
  getSchoolAdmissionStats,
  exportSchoolLearnersList
};
