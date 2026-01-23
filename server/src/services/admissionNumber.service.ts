import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique, human-readable admission number scoped per school with branch prefix
 * 
 * Format depends on school's admissionFormatType:
 * - NO_BRANCH:           ADM-{YEAR}-{SEQUENCE}
 * - BRANCH_PREFIX_START: {BRANCH_CODE}-ADM-{YEAR}-{SEQUENCE}
 * - BRANCH_PREFIX_MIDDLE: ADM-{BRANCH_CODE}-{YEAR}-{SEQUENCE}
 * - BRANCH_PREFIX_END:   ADM-{YEAR}-{SEQUENCE}-{BRANCH_CODE}
 *
 * Example outputs:
 * - NO_BRANCH:           ADM-2025-001
 * - BRANCH_PREFIX_START: KB-ADM-2025-001
 * - BRANCH_PREFIX_MIDDLE: ADM-KB-2025-001
 * - BRANCH_PREFIX_END:   ADM-2025-001-KB
 *
 * Uses database-level locking to prevent race conditions in concurrent environments
 * Admission numbers are unique per SCHOOL (not per branch)
 */
export async function generateAdmissionNumber(
  schoolId: string,
  branchCode: string,
  academicYear: number
): Promise<string> {
  try {
    // Verify school exists and get its format configuration
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    // Verify branch exists
    const branch = await prisma.branch.findFirst({
      where: {
        schoolId,
        code: branchCode
      }
    });

    if (!branch) {
      throw new Error(`Branch with code ${branchCode} not found in school ${schoolId}`);
    }

    // Lock and update sequence in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Try to find existing sequence for this school and year (school-wide, not per branch)
      let sequence = await tx.admissionSequence.findUnique({
        where: {
          schoolId_academicYear: { schoolId, academicYear }
        }
      });

      // If sequence doesn't exist, create it
      if (!sequence) {
        sequence = await tx.admissionSequence.create({
          data: {
            schoolId,
            academicYear,
            currentValue: 0
          }
        });
      }

      // Increment the sequence value
      const updated = await tx.admissionSequence.update({
        where: {
          schoolId_academicYear: { schoolId, academicYear }
        },
        data: {
          currentValue: {
            increment: 1
          }
        }
      });

      return updated;
    });

    // Format the admission number based on school's format type
    const paddedNumber = String(result.currentValue).padStart(3, '0');
    const separator = school.branchSeparator || '-';
    let admissionNumber: string;

    switch (school.admissionFormatType) {
      case 'NO_BRANCH':
        // ADM-2025-001 (no branch prefix)
        admissionNumber = `ADM${separator}${academicYear}${separator}${paddedNumber}`;
        break;

      case 'BRANCH_PREFIX_START':
        // KB-ADM-2025-001 (branch code at start)
        admissionNumber = `${branchCode}${separator}ADM${separator}${academicYear}${separator}${paddedNumber}`;
        break;

      case 'BRANCH_PREFIX_MIDDLE':
        // ADM-KB-2025-001 (branch code in middle)
        admissionNumber = `ADM${separator}${branchCode}${separator}${academicYear}${separator}${paddedNumber}`;
        break;

      case 'BRANCH_PREFIX_END':
        // ADM-2025-001-KB (branch code at end)
        admissionNumber = `ADM${separator}${academicYear}${separator}${paddedNumber}${separator}${branchCode}`;
        break;

      default:
        throw new Error(`Unknown admission format type: ${school.admissionFormatType}`);
    }

    console.log(
      `✓ Generated admission number: ${admissionNumber} for school ${school.name}, branch ${branchCode}`
    );

    return admissionNumber;
  } catch (error) {
    console.error('✗ Error generating admission number:', error);
    throw error;
  }
}

/**
 * Gets the current sequence value for a school in a given academic year
 * Useful for checking what the next admission number will be
 * Note: Sequence is school-wide, not per branch
 */
export async function getCurrentSequenceValue(
  schoolId: string,
  academicYear: number
): Promise<number | null> {
  try {
    const sequence = await prisma.admissionSequence.findUnique({
      where: {
        schoolId_academicYear: { schoolId, academicYear }
      }
    });

    if (!sequence) {
      console.log(`ℹ No sequence found for school ${schoolId} in year ${academicYear}`);
      return null;
    }

    return sequence.currentValue;
  } catch (error) {
    console.error('✗ Error fetching current sequence value:', error);
    throw error;
  }
}

/**
 * Gets the next admission number that would be generated (without incrementing)
 * Useful for previewing what the next number will be
 */
export async function getNextAdmissionNumberPreview(
  schoolId: string,
  branchCode: string,
  academicYear: number
): Promise<string | null> {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    const sequence = await prisma.admissionSequence.findUnique({
      where: {
        schoolId_academicYear: { schoolId, academicYear }
      }
    });

    if (!sequence) {
      return null;
    }

    const nextNumber = sequence.currentValue + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    const separator = school.branchSeparator || '-';

    let nextAdmissionNumber: string;

    switch (school.admissionFormatType) {
      case 'NO_BRANCH':
        nextAdmissionNumber = `ADM${separator}${academicYear}${separator}${paddedNumber}`;
        break;
      case 'BRANCH_PREFIX_START':
        nextAdmissionNumber = `${branchCode}${separator}ADM${separator}${academicYear}${separator}${paddedNumber}`;
        break;
      case 'BRANCH_PREFIX_MIDDLE':
        nextAdmissionNumber = `ADM${separator}${branchCode}${separator}${academicYear}${separator}${paddedNumber}`;
        break;
      case 'BRANCH_PREFIX_END':
        nextAdmissionNumber = `ADM${separator}${academicYear}${separator}${paddedNumber}${separator}${branchCode}`;
        break;
      default:
        return null;
    }

    return nextAdmissionNumber;
  } catch (error) {
    console.error('✗ Error previewing next admission number:', error);
    return null;
  }
}

/**
 * Resets the sequence for a school in a given academic year
 * Use with caution - only for administrative corrections
 * 
 * Note: This affects the entire school, not just a branch
 * @param newValue The value to reset to (default 0)
 */
export async function resetSequence(
  schoolId: string,
  academicYear: number,
  newValue: number = 0
): Promise<void> {
  try {
    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    await prisma.admissionSequence.upsert({
      where: {
        schoolId_academicYear: { schoolId, academicYear }
      },
      update: {
        currentValue: newValue
      },
      create: {
        schoolId,
        academicYear,
        currentValue: newValue
      }
    });

    console.log(
      `✓ Sequence reset for school ${schoolId} in academic year ${academicYear} to ${newValue}`
    );
  } catch (error) {
    console.error('✗ Error resetting sequence:', error);
    throw error;
  }
}

/**
 * Validates that an admission number follows the correct format for a school
 * Takes into account the school's chosen format type
 */
export async function validateAdmissionNumberFormat(
  schoolId: string,
  admissionNumber: string,
  expectedYear: number
): Promise<boolean> {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      console.warn(`School not found: ${schoolId}`);
      return false;
    }

    const separator = school.branchSeparator || '-';
    const escapedSeparator = separator === '.' ? '\\.' : separator;

    let pattern: RegExp;

    switch (school.admissionFormatType) {
      case 'NO_BRANCH':
        // ADM-2025-001
        pattern = new RegExp(`^ADM${escapedSeparator}(\\d{4})${escapedSeparator}(\\d{3})$`);
        break;

      case 'BRANCH_PREFIX_START':
        // KB-ADM-2025-001
        pattern = new RegExp(
          `^([A-Z0-9]+)${escapedSeparator}ADM${escapedSeparator}(\\d{4})${escapedSeparator}(\\d{3})$`
        );
        break;

      case 'BRANCH_PREFIX_MIDDLE':
        // ADM-KB-2025-001
        pattern = new RegExp(
          `^ADM${escapedSeparator}([A-Z0-9]+)${escapedSeparator}(\\d{4})${escapedSeparator}(\\d{3})$`
        );
        break;

      case 'BRANCH_PREFIX_END':
        // ADM-2025-001-KB
        pattern = new RegExp(
          `^ADM${escapedSeparator}(\\d{4})${escapedSeparator}(\\d{3})${escapedSeparator}([A-Z0-9]+)$`
        );
        break;

      default:
        console.warn(`Unknown admission format type: ${school.admissionFormatType}`);
        return false;
    }

    const match = admissionNumber.match(pattern);

    if (!match) {
      console.warn(`✗ Invalid admission number format: ${admissionNumber}`);
      return false;
    }

    // Extract year depending on format type
    let year: number;

    switch (school.admissionFormatType) {
      case 'NO_BRANCH':
        year = parseInt(match[1], 10);
        break;
      case 'BRANCH_PREFIX_START':
        year = parseInt(match[2], 10);
        break;
      case 'BRANCH_PREFIX_MIDDLE':
        year = parseInt(match[2], 10);
        break;
      case 'BRANCH_PREFIX_END':
        year = parseInt(match[2], 10);
        break;
      default:
        return false;
    }

    if (year !== expectedYear) {
      console.warn(
        `✗ Admission number year ${year} does not match expected year ${expectedYear}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('✗ Error validating admission number format:', error);
    return false;
  }
}

/**
 * Extracts the sequence number from an admission number
 * Takes into account the school's admission format
 */
export function extractSequenceNumber(
  admissionNumber: string,
  formatType: string = 'BRANCH_PREFIX_START',
  separator: string = '-'
): number | null {
  try {
    const escapedSeparator = separator === '.' ? '\\.' : separator;
    let pattern: RegExp;

    switch (formatType) {
      case 'NO_BRANCH':
        // ADM-2025-001 → 001
        pattern = new RegExp(`^ADM${escapedSeparator}\\d{4}${escapedSeparator}(\\d{3})$`);
        break;

      case 'BRANCH_PREFIX_START':
        // KB-ADM-2025-001 → 001
        pattern = new RegExp(
          `^[A-Z0-9]+${escapedSeparator}ADM${escapedSeparator}\\d{4}${escapedSeparator}(\\d{3})$`
        );
        break;

      case 'BRANCH_PREFIX_MIDDLE':
        // ADM-KB-2025-001 → 001
        pattern = new RegExp(
          `^ADM${escapedSeparator}[A-Z0-9]+${escapedSeparator}\\d{4}${escapedSeparator}(\\d{3})$`
        );
        break;

      case 'BRANCH_PREFIX_END':
        // ADM-2025-001-KB → 001
        pattern = new RegExp(
          `^ADM${escapedSeparator}\\d{4}${escapedSeparator}(\\d{3})${escapedSeparator}[A-Z0-9]+$`
        );
        break;

      default:
        return null;
    }

    const match = admissionNumber.match(pattern);

    if (!match) {
      console.warn(`✗ Could not extract sequence number from: ${admissionNumber}`);
      return null;
    }

    return parseInt(match[1], 10);
  } catch (error) {
    console.error('✗ Error extracting sequence number:', error);
    return null;
  }
}

/**
 * Extracts the academic year from an admission number
 * Takes into account the school's admission format
 */
export function extractAcademicYear(
  admissionNumber: string,
  formatType: string = 'BRANCH_PREFIX_START',
  separator: string = '-'
): number | null {
  try {
    const escapedSeparator = separator === '.' ? '\\.' : separator;
    let pattern: RegExp;

    switch (formatType) {
      case 'NO_BRANCH':
        // ADM-2025-001 → 2025
        pattern = new RegExp(`^ADM${escapedSeparator}(\\d{4})${escapedSeparator}\\d{3}$`);
        break;

      case 'BRANCH_PREFIX_START':
        // KB-ADM-2025-001 → 2025
        pattern = new RegExp(
          `^[A-Z0-9]+${escapedSeparator}ADM${escapedSeparator}(\\d{4})${escapedSeparator}\\d{3}$`
        );
        break;

      case 'BRANCH_PREFIX_MIDDLE':
        // ADM-KB-2025-001 → 2025
        pattern = new RegExp(
          `^ADM${escapedSeparator}[A-Z0-9]+${escapedSeparator}(\\d{4})${escapedSeparator}\\d{3}$`
        );
        break;

      case 'BRANCH_PREFIX_END':
        // ADM-2025-001-KB → 2025
        pattern = new RegExp(
          `^ADM${escapedSeparator}(\\d{4})${escapedSeparator}\\d{3}${escapedSeparator}[A-Z0-9]+$`
        );
        break;

      default:
        return null;
    }

    const match = admissionNumber.match(pattern);

    if (!match) {
      console.warn(`✗ Could not extract academic year from: ${admissionNumber}`);
      return null;
    }

    return parseInt(match[1], 10);
  } catch (error) {
    console.error('✗ Error extracting academic year:', error);
    return null;
  }
}

/**
 * Extracts the branch code from an admission number
 * Takes into account the school's admission format
 * Returns null if format doesn't include branch code
 */
export function extractBranchCode(
  admissionNumber: string,
  formatType: string = 'BRANCH_PREFIX_START',
  separator: string = '-'
): string | null {
  try {
    const escapedSeparator = separator === '.' ? '\\.' : separator;
    let pattern: RegExp;

    switch (formatType) {
      case 'NO_BRANCH':
        // No branch code in this format
        return null;

      case 'BRANCH_PREFIX_START':
        // KB-ADM-2025-001 → KB
        pattern = new RegExp(
          `^([A-Z0-9]+)${escapedSeparator}ADM${escapedSeparator}\\d{4}${escapedSeparator}\\d{3}$`
        );
        break;

      case 'BRANCH_PREFIX_MIDDLE':
        // ADM-KB-2025-001 → KB
        pattern = new RegExp(
          `^ADM${escapedSeparator}([A-Z0-9]+)${escapedSeparator}\\d{4}${escapedSeparator}\\d{3}$`
        );
        break;

      case 'BRANCH_PREFIX_END':
        // ADM-2025-001-KB → KB
        pattern = new RegExp(
          `^ADM${escapedSeparator}\\d{4}${escapedSeparator}\\d{3}${escapedSeparator}([A-Z0-9]+)$`
        );
        break;

      default:
        return null;
    }

    const match = admissionNumber.match(pattern);

    if (!match) {
      console.warn(`✗ Could not extract branch code from: ${admissionNumber}`);
      return null;
    }

    return match[1];
  } catch (error) {
    console.error('✗ Error extracting branch code:', error);
    return null;
  }
}
