import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import prisma from '../config/database';
import { generateAdmissionNumber, getCurrentSequenceValue, resetSequence, getNextAdmissionNumberPreview } from '../services/admissionNumber.service';
import { provisionNewSchool, SchoolProvisioningData } from '../services/school-provisioning.service';
import { deleteSchoolSafely } from '../services/school-deletion.service';
import { auditService } from '../services/audit.service';

// ============================================
// SCHOOL MANAGEMENT ENDPOINTS
// ============================================

/**
 * Create a new school with COMPLETE provisioning (RECOMMENDED)
 * POST /api/schools/provision
 * 
 * Body:
 * {
 *   schoolName: string,
 *   admissionFormatType: string,
 *   adminEmail: string,
 *   adminFirstName: string,
 *   adminLastName: string,
 *   adminPhone?: string,
 *   ... other school fields
 * }
 */
export const createSchoolWithProvisioning = async (req: AuthRequest, res: Response) => {
  try {
    // Validate required fields
    const { schoolName, adminEmail, adminFirstName, adminLastName, admissionFormatType } = req.body;

    if (!schoolName || !adminEmail || !adminFirstName || !adminLastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['schoolName', 'adminEmail', 'adminFirstName', 'adminLastName', 'admissionFormatType']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Admin email already exists in the system'
      });
    }

    // Provision school with complete setup
    const provisioningData: SchoolProvisioningData = {
      schoolName: req.body.schoolName,
      admissionFormatType: req.body.admissionFormatType || 'BRANCH_PREFIX_START',
      branchSeparator: req.body.branchSeparator,
      adminEmail: req.body.adminEmail,
      adminFirstName: req.body.adminFirstName,
      adminLastName: req.body.adminLastName,
      adminPhone: req.body.adminPhone,
      planId: req.body.planId,
      trialDays: req.body.trialDays,
      // Optional school details
      registrationNo: req.body.registrationNo,
      address: req.body.address,
      county: req.body.county,
      subCounty: req.body.subCounty,
      ward: req.body.ward,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      principalName: req.body.principalName,
      principalPhone: req.body.principalPhone,
      motto: req.body.motto,
      vision: req.body.vision,
      mission: req.body.mission
    };

    const result = await provisionNewSchool(provisioningData);

    // Log audit event
    try {
      await auditService.logChange({
        schoolId: result.school.id,
        entityType: 'School',
        entityId: result.school.id,
        action: 'CREATE',
        userId: req.user?.email || 'SUPER_ADMIN',
        newValue: JSON.stringify({
          schoolName: result.school.name,
          adminEmail: result.adminUser.email,
          subscriptionExpires: result.subscription.expiresAt
        })
      });
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }

    res.status(201).json({
      success: true,
      message: 'School provisioned successfully',
      data: {
        school: result.school,
        adminUser: {
          id: result.adminUser.id,
          email: result.adminUser.email,
          firstName: result.adminUser.firstName,
          lastName: result.adminUser.lastName,
          role: result.adminUser.role
        },
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          expiresAt: result.subscription.expiresAt
        },
        defaultBranch: result.defaultBranch,
        temporaryPassword: result.tempPassword,
        loginUrl: result.loginUrl
      },
      instructions: {
        message: 'Save the temporary password and share it securely with the admin.',
        adminLoginSteps: [
          `1. Visit: ${result.loginUrl}`,
          `2. Email: ${result.adminUser.email}`,
          `3. Password: ${result.tempPassword}`,
          '4. Change password after first login'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error provisioning school:', error);
    res.status(500).json({
      error: 'Failed to provision school',
      message: error.message
    });
  }
};

/**
 * Create a new school with admission format configuration
 * POST /api/schools
 * 
 * NOTE: This creates only the school record. Use /api/schools/provision for complete setup.
 * 
 * Body:
 * {
 *   name: string,
 *   admissionFormatType: "NO_BRANCH" | "BRANCH_PREFIX_START" | "BRANCH_PREFIX_MIDDLE" | "BRANCH_PREFIX_END",
 *   branchSeparator: "-" | "_" | "" (default: "-"),
 *   ... other school fields
 * }
 */
export const createSchool = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      admissionFormatType = 'BRANCH_PREFIX_START',
      branchSeparator = '-',
      registrationNo,
      address,
      county,
      subCounty,
      ward,
      phone,
      email,
      website,
      principalName,
      principalPhone,
      logoUrl,
      faviconUrl,
      schoolType,
      motto,
      vision,
      mission,
      curriculumType,
      assessmentMode,
      status = 'TRIAL',
      trialDays = 30,
      // Provisioning options
      createDefaultBranch = true,
      branchName = 'Main Campus',
      branchCode = 'MC',
      createStreams = true,
      streamNames = ['A', 'B', 'C', 'D'],
      initializeGrading = true
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

    // Use transaction to create school with all related data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create School
      const school = await tx.school.create({
        data: {
          name,
          admissionFormatType,
          branchSeparator,
          registrationNo,
          address,
          county,
          subCounty,
          ward,
          phone,
          email,
          website,
          principalName,
          principalPhone,
          logoUrl,
          faviconUrl,
          schoolType,
          motto,
          vision,
          mission,
          curriculumType: curriculumType || 'CBC_AND_EXAM',
          assessmentMode: assessmentMode || 'MIXED',
          active: status === 'ACTIVE' || status === 'TRIAL',
          status,
          trialStart: status === 'TRIAL' ? new Date() : null,
          trialDays: status === 'TRIAL' ? trialDays : null
        }
      });

      let branch = null;

      // 2. Create Default Branch (if requested)
      if (createDefaultBranch) {
        branch = await tx.branch.create({
          data: {
            schoolId: school.id,
            name: branchName,
            code: branchCode.toUpperCase(),
            address: address || '',
            phone: phone || '',
            email: email || '',
            principalName: principalName || '',
            active: true
          }
        });
      }

      // 3. Create Admission Sequence
      await tx.admissionSequence.create({
        data: {
          schoolId: school.id,
          academicYear: new Date().getFullYear(),
          currentValue: 0
        }
      });

      // 4. Create Streams (if requested)
      if (createStreams && Array.isArray(streamNames) && streamNames.length > 0) {
        for (const streamName of streamNames) {
          if (streamName.trim()) {
            await tx.streamConfig.create({
              data: {
                schoolId: school.id,
                name: streamName.trim(),
                active: true
              }
            });
          }
        }
      }

      return { school, branch };
    });

    // 5. Initialize Grading Systems (outside transaction)
    if (initializeGrading) {
      try {
        const { gradingService } = await import('../services/grading.service');
        await gradingService.getGradingSystem(result.school.id, 'SUMMATIVE');
        await gradingService.getGradingSystem(result.school.id, 'CBC');
      } catch (error) {
        console.warn('Warning: Failed to initialize grading systems:', error);
      }
    }

    console.log(`✅ School created: ${result.school.name} (ID: ${result.school.id})`);
    if (result.branch) {
      console.log(`   - Branch: ${result.branch.name} (${result.branch.code})`);
    }
    if (createStreams) {
      console.log(`   - Streams: ${streamNames.join(', ')} created`);
    }
    if (initializeGrading) {
      console.log(`   - Grading systems initialized`);
    }

    const school = result.school;

    res.status(201).json({
      message: 'School created successfully',
      warning: 'NOTE: This endpoint creates only the school record. Use POST /api/schools/provision for complete setup with admin user and subscription.',
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
export const getAllSchools = async (req: AuthRequest, res: Response) => {
  try {
    const whereClause: any = { active: true };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.id = req.user.schoolId;
    }

    const schools = await prisma.school.findMany({
      where: whereClause,
      include: {
        branches: {
          select: {
            id: true,
            code: true,
            name: true,
            active: true
          },
          where: {
            active: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: { learners: true }
        }
      },
      orderBy: { name: 'asc' }
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
export const getSchoolById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== id) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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
export const updateSchool = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== id) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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

    // SYNC LOGIC: If school phone is updated, also update the requester's phone if they are an ADMIN
    // This ensures OTPs sent to user.phone are in sync with school settings
    let userUpdated = false;
    if (req.user?.userId && req.user.role === 'ADMIN' && (updateData.phone || updateData.principalPhone)) {
      try {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { phone: updateData.phone || updateData.principalPhone }
        });
        userUpdated = true;
        console.log(`✅ Synced account phone for admin user ${req.user.userId} with school phone`);
      } catch (userErr) {
        console.error('Failed to sync admin user phone:', userErr);
      }
    }

    res.status(200).json({
      message: 'School updated successfully',
      data: school,
      userSynced: userUpdated
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
/**
 * Delete a school
 * DELETE /api/schools/:id
 * Supports soft delete and hard delete options via query params
 * ?hardDelete=true (permanent)
 * ?exportData=true (CSV export)
 */
export const deleteSchool = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hardDelete, exportData, notifyUsers, reason } = req.query;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== id) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

    // Call safe deletion service
    const result = await deleteSchoolSafely(id, {
      hardDelete: hardDelete === 'true',
      exportData: exportData === 'true' || exportData === '1', // Default false unless specified
      notifyUsers: notifyUsers === 'true',
      deletedBy: req.user?.userId || 'system',
      reason: reason as string || 'API request'
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error: any) {
    console.error('Error deleting school:', error);
    res.status(500).json({
      error: 'Failed to delete school',
      message: error.message
    });
  }
};

export const deactivateSchool = async (req: AuthRequest, res: Response) => {
  try {
    const { id, schoolId } = req.params as any;
    const targetId = schoolId || id;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== targetId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

    const exists = await prisma.school.findUnique({ where: { id: targetId } });
    if (!exists) {
      return res.status(404).json({ error: 'School not found' });
    }
    const school = await prisma.school.update({
      where: { id: targetId },
      data: {
        active: false,
        status: 'INACTIVE'
      }
    });
    res.status(200).json({
      message: 'School deactivated successfully',
      data: school
    });
  } catch (error) {
    console.error('Error deactivating school:', error);
    res.status(500).json({ error: 'Failed to deactivate school' });
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
export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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
export const getBranchesBySchool = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const branches = await prisma.branch.findMany({
      where: { schoolId, archived: false },
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
export const getBranchById = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

    if (req.user?.branchId && req.user.branchId !== branchId) {
      return res.status(403).json({ error: 'Unauthorized access to branch' });
    }

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
export const updateBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;
    const updateData = req.body;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

    if (req.user?.branchId && req.user.branchId !== branchId) {
      return res.status(403).json({ error: 'Unauthorized access to branch' });
    }

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
export const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId, branchId } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (isSuperAdmin) {
      await prisma.branch.delete({
        where: { id: branchId }
      });

      res.status(200).json({
        message: 'Branch permanently deleted by Super Admin'
      });
    } else {
      await prisma.branch.update({
        where: { id: branchId },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: req.user?.userId,
          active: false
        }
      });

      res.status(200).json({
        message: 'Branch archived successfully'
      });
    }
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
export const getAdmissionSequence = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId, academicYear } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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
export const getAdmissionNumberPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId, academicYear } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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
          branchId: branch.id,
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
export const resetAdmissionSequence = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && req.user.schoolId !== schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to school' });
    }

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
