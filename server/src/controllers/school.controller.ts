import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateAdmissionNumber, getCurrentSequenceValue, resetSequence, getNextAdmissionNumberPreview } from '../services/admissionNumber.service';

const prisma = new PrismaClient();

// ============================================
// SCHOOL MANAGEMENT ENDPOINTS
// ============================================

/**
 * Create a new school with admission format configuration
 * POST /api/schools
 * 
 * Body:
 * {
 *   name: string,
 *   admissionFormatType: "NO_BRANCH" | "BRANCH_PREFIX_START" | "BRANCH_PREFIX_MIDDLE" | "BRANCH_PREFIX_END",
 *   branchSeparator: "-" | "_" | "" (default: "-"),
 *   ... other school fields
 * }
 */
export const createSchool = async (req: Request, res: Response) => {
  try {
    const {
      name,
      admissionFormatType = 'BRANCH_PREFIX_START',
      branchSeparator = '-',
      registrationNo,
      address,
      county,
      subCounty,
      phone,
      email,
      website,
      principalName,
      principalPhone,
      logoUrl
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    // Validate admission format type
    const validFormats = ['NO_BRANCH', 'BRANCH_PREFIX_START', 'BRANCH_PREFIX_MIDDLE', 'BRANCH_PREFIX_END'];
    if (!validFormats.includes(admissionFormatType)) {
      return res.status(400).json({
        error: `Invalid admission format type. Must be one of: ${validFormats.join(', ')}`
      });
    }

    // Validate separator
    const validSeparators = ['-', '_', ''];
    if (!validSeparators.includes(branchSeparator)) {
      return res.status(400).json({
        error: 'Invalid branch separator. Must be "-", "_", or "" (empty string)'
      });
    }

    const school = await prisma.school.create({
      data: {
        name,
        admissionFormatType,
        branchSeparator,
        registrationNo,
        address,
        county,
        subCounty,
        phone,
        email,
        website,
        principalName,
        principalPhone,
        logoUrl,
        active: true
      }
    });

    res.status(201).json({
      message: 'School created successfully',
      data: school
    });
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: `A school with this ${error.meta?.target[0]} already exists`
      });
    }

    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
};

/**
 * Get all schools
 * GET /api/schools
 */
export const getAllSchools = async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        branches: {
          select: {
            id: true,
            code: true,
            name: true,
            active: true
          }
        },
        _count: {
          select: { learners: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      data: schools,
      count: schools.length
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
};

/**
 * Get a single school by ID with all details
 * GET /api/schools/:id
 */
export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            active: true
          }
        },
        learners: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            grade: true,
            status: true,
            branch: {
              select: { code: true, name: true }
            }
          },
          take: 10 // Limit to 10 for performance
        },
        admissionSequences: {
          orderBy: { academicYear: 'desc' }
        },
        _count: {
          select: { learners: true, branches: true }
        }
      }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.status(200).json({ data: school });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
};

/**
 * Update a school (except admission format which is immutable)
 * PUT /api/schools/:id
 */
export const updateSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating admission format (immutable after creation)
    if (updateData.admissionFormatType) {
      return res.status(400).json({
        error: 'Admission format type cannot be changed after school creation. It is immutable.'
      });
    }

    if (updateData.branchSeparator) {
      return res.status(400).json({
        error: 'Branch separator cannot be changed after school creation. It is immutable.'
      });
    }

    // Verify school exists
    const schoolExists = await prisma.school.findUnique({
      where: { id }
    });

    if (!schoolExists) {
      return res.status(404).json({ error: 'School not found' });
    }

    const school = await prisma.school.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      message: 'School updated successfully',
      data: school
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: `A school with this ${error.meta?.target[0]} already exists`
      });
    }

    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Failed to update school' });
  }
};

/**
 * Delete a school
 * DELETE /api/schools/:id
 * Note: This will cascade delete all branches, learners, and related data
 */
export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id },
      include: { _count: { select: { learners: true } } }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Warn if school has learners
    if (school._count.learners > 0) {
      return res.status(400).json({
        error: `Cannot delete school with ${school._count.learners} learners. Please transfer or delete learners first.`
      });
    }

    await prisma.school.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'School deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
};

// ============================================
// BRANCH MANAGEMENT ENDPOINTS
// ============================================

/**
 * Create a new branch for a school
 * POST /api/schools/:schoolId/branches
 * 
 * Body:
 * {
 *   name: string,
 *   code: string (e.g., "KB", "MB", "HQ"),
 *   address?: string,
 *   phone?: string,
 *   email?: string,
 *   principalName?: string
 * }
 */
export const createBranch = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { name, code, address, phone, email, principalName } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ error: 'Branch name and code are required' });
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Validate branch code format (alphanumeric, 1-10 characters)
    if (!/^[A-Z0-9]{1,10}$/.test(code)) {
      return res.status(400).json({
        error: 'Branch code must be 1-10 uppercase alphanumeric characters (e.g., KB, MB, HQ)'
      });
    }

    const branch = await prisma.branch.create({
      data: {
        schoolId,
        name,
        code: code.toUpperCase(),
        address,
        phone,
        email,
        principalName,
        active: true
      }
    });

    res.status(201).json({
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: `A branch with code ${req.body.code} already exists in this school`
      });
    }

    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

/**
 * Get all branches for a school
 * GET /api/schools/:schoolId/branches
 */
export const getBranchesBySchool = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const branches = await prisma.branch.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { learners: true, classes: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      data: branches,
      count: branches.length
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

/**
 * Get a single branch by ID
 * GET /api/schools/:schoolId/branches/:branchId
 */
export const getBranchById = async (req: Request, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            admissionFormatType: true,
            branchSeparator: true
          }
        },
        learners: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            grade: true,
            status: true
          },
          take: 10
        },
        classes: {
          select: {
            id: true,
            name: true,
            grade: true,
            stream: true
          }
        },
        _count: {
          select: { learners: true, classes: true }
        }
      }
    });

    if (!branch || branch.school.id !== schoolId) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.status(200).json({ data: branch });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

/**
 * Update a branch
 * PUT /api/schools/:schoolId/branches/:branchId
 */
export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;
    const updateData = req.body;

    // Prevent updating branch code (immutable)
    if (updateData.code) {
      return res.status(400).json({
        error: 'Branch code cannot be changed after creation. It is immutable.'
      });
    }

    // Verify branch belongs to school
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch || branch.schoolId !== schoolId) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: updateData
    });

    res.status(200).json({
      message: 'Branch updated successfully',
      data: updatedBranch
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

/**
 * Delete a branch
 * DELETE /api/schools/:schoolId/branches/:branchId
 */
export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;

    // Verify branch belongs to school
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { _count: { select: { learners: true } } }
    });

    if (!branch || branch.schoolId !== schoolId) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Prevent deleting branch with learners
    if (branch._count.learners > 0) {
      return res.status(400).json({
        error: `Cannot delete branch with ${branch._count.learners} learners. Please transfer learners first.`
      });
    }

    await prisma.branch.delete({
      where: { id: branchId }
    });

    res.status(200).json({
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};

// ============================================
// ADMISSION SEQUENCE MANAGEMENT ENDPOINTS
// ============================================

/**
 * Get admission sequence status for a school
 * GET /api/schools/:schoolId/admission-sequence/:academicYear
 */
export const getAdmissionSequence = async (req: Request, res: Response) => {
  try {
    const { schoolId, academicYear } = req.params;

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const sequence = await prisma.admissionSequence.findUnique({
      where: {
        schoolId_academicYear: {
          schoolId,
          academicYear: parseInt(academicYear)
        }
      }
    });

    if (!sequence) {
      return res.status(404).json({
        error: 'No admission sequence found for this school and year'
      });
    }

    res.status(200).json({
      data: {
        ...sequence,
        nextSequenceNumber: sequence.currentValue + 1,
        nextSequenceNumberPadded: String(sequence.currentValue + 1).padStart(3, '0')
      }
    });
  } catch (error) {
    console.error('Error fetching admission sequence:', error);
    res.status(500).json({ error: 'Failed to fetch admission sequence' });
  }
};

/**
 * Get preview of next admission number(s) for each branch
 * GET /api/schools/:schoolId/admission-number-preview/:academicYear
 */
export const getAdmissionNumberPreview = async (req: Request, res: Response) => {
  try {
    const { schoolId, academicYear } = req.params;

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: { branches: true }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Get preview for each branch
    const previews = await Promise.all(
      school.branches.map(async (branch) => {
        const nextNumber = await getNextAdmissionNumberPreview(
          schoolId,
          branch.code,
          parseInt(academicYear)
        );

        return {
          branchCode: branch.code,
          branchName: branch.name,
          nextAdmissionNumber: nextNumber
        };
      })
    );

    res.status(200).json({
      data: {
        school: school.name,
        admissionFormatType: school.admissionFormatType,
        branchSeparator: school.branchSeparator,
        academicYear: parseInt(academicYear),
        previews
      }
    });
  } catch (error) {
    console.error('Error previewing admission numbers:', error);
    res.status(500).json({ error: 'Failed to preview admission numbers' });
  }
};

/**
 * Reset admission sequence for administrative purposes
 * POST /api/schools/:schoolId/reset-sequence
 * This should be restricted to super admins only
 */
export const resetAdmissionSequence = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { academicYear, newValue = 0 } = req.body;

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    await resetSequence(schoolId, parseInt(academicYear), parseInt(newValue));

    res.status(200).json({
      message: 'Admission sequence reset successfully',
      data: {
        schoolId,
        academicYear,
        newValue
      }
    });
  } catch (error) {
    console.error('Error resetting admission sequence:', error);
    res.status(500).json({ error: 'Failed to reset admission sequence' });
  }
};
