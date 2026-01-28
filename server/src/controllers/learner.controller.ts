/**
 * Learner Controller
 * Handles learner management operations with role-based access control
 * 
 * @module controllers/learner.controller
 */

import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';
import { Grade, LearnerStatus, Gender } from '@prisma/client';

export class LearnerController {
  /**
   * Get all learners
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER (own class), PARENT (own children)
   */
  async getAllLearners(req: AuthRequest, res: Response) {
    const currentUserRole = req.user!.role;
    const currentUserId = req.user!.userId;

    // Query parameters for filtering
    const { grade, stream, status, search, page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause based on role
    let whereClause: any = { archived: false };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }
    if (req.user?.branchId) {
      whereClause.branchId = req.user.branchId;
    }

    if (currentUserRole === 'PARENT') {
      // Parents can only see their own children
      whereClause.parentId = currentUserId;
    } else if (currentUserRole === 'TEACHER') {
      // Teachers see learners in their assigned classes
      // TODO: Implement class assignment when class model is created
      // For now, teachers can see all active learners
      whereClause.status = 'ACTIVE';
    }

    // Apply filters
    if (grade) whereClause.grade = grade as Grade;
    if (stream) whereClause.stream = String(stream);
    if (status) whereClause.status = status as LearnerStatus;

    // Search by name or admission number
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { admissionNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [learners, total] = await Promise.all([
      prisma.learner.findMany({
        where: whereClause,
        include: {
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: [
          { grade: 'asc' },
          { stream: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        skip,
        take: Number(limit),
      }),
      prisma.learner.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: learners,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  /**
   * Get learner statistics
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async getLearnerStats(req: AuthRequest, res: Response) {
    const whereClause: any = {};

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }
    if (req.user?.branchId) {
      whereClause.branchId = req.user.branchId;
    }

    // Get counts by status
    const statusCounts = await prisma.learner.groupBy({
      by: ['status'],
      _count: true,
      where: whereClause,
    });

    // Get counts by grade
    const gradeCounts = await prisma.learner.groupBy({
      by: ['grade'],
      _count: true,
      where: { ...whereClause, status: 'ACTIVE' },
    });

    // Get counts by gender
    const genderCounts = await prisma.learner.groupBy({
      by: ['gender'],
      _count: true,
      where: { ...whereClause, status: 'ACTIVE' },
    });

    // Total learners
    const total = await prisma.learner.count({ where: whereClause });
    const active = await prisma.learner.count({ where: { ...whereClause, status: 'ACTIVE' } });

    res.json({
      success: true,
      data: {
        total,
        active,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byGrade: gradeCounts.reduce((acc, item) => {
          acc[item.grade] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byGender: genderCounts.reduce((acc, item) => {
          acc[item.gender] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  }

  /**
   * Get single learner by ID
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT (own child)
   */
  async getLearnerById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    const learner = await prisma.learner.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      if (learner.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
      if (req.user.branchId && learner.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
    }

    // Check access rights
    if (currentUserRole === 'PARENT' && learner.parentId !== currentUserId) {
      throw new ApiError(403, 'You can only access your own children');
    }

    res.json({
      success: true,
      data: learner,
    });
  }

  /**
   * Get learner by admission number
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getLearnerByAdmissionNumber(req: AuthRequest, res: Response) {
    const { admissionNumber } = req.params;
    let { schoolId } = req.query;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      throw new ApiError(400, 'schoolId is required');
    }

    const learner = await prisma.learner.findUnique({
      where: {
        schoolId_admissionNumber: {
          schoolId: schoolId as string,
          admissionNumber
        }
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    res.json({
      success: true,
      data: learner,
    });
  }

  /**
   * Create new learner
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async createLearner(req: AuthRequest, res: Response) {
    const currentUserId = req.user!.userId;

    let {
      schoolId,
      branchId,
      admissionNumber,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      grade,
      stream,
      parentId,
      guardianName,
      guardianPhone,
      guardianEmail,
      medicalConditions,
      allergies,
      emergencyContact,
      emergencyPhone,
      bloodGroup,
      address,
      county,
      subCounty,
      previousSchool,
      religion,
      specialNeeds,
    } = req.body;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      schoolId = req.user.schoolId;

      if (req.user.branchId) {
        branchId = req.user.branchId;
      } else {
        // Verify branch belongs to school
        if (branchId) {
          const branch = await prisma.branch.findUnique({ where: { id: branchId } });
          if (!branch || branch.schoolId !== schoolId) {
            throw new ApiError(400, 'Invalid branch for this school');
          }
        }
      }
    }

    // Validate required fields
    if (!schoolId || !branchId || !admissionNumber || !firstName || !lastName || !dateOfBirth || !gender || !grade) {
      throw new ApiError(400, 'Missing required fields: schoolId, branchId, admissionNumber, firstName, lastName, dateOfBirth, gender, grade');
    }

    // Check if admission number already exists within school
    const existing = await prisma.learner.findUnique({
      where: {
        schoolId_admissionNumber: {
          schoolId,
          admissionNumber
        }
      },
    });

    if (existing) {
      throw new ApiError(400, `Learner with admission number ${admissionNumber} already exists`);
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await prisma.user.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new ApiError(400, 'Parent user not found');
      }
      if (parent.role !== 'PARENT') {
        throw new ApiError(400, 'Specified user is not a parent');
      }
    }

    // Create learner
    const learner = await prisma.learner.create({
      data: {
        schoolId,
        branchId,
        admissionNumber,
        firstName,
        lastName,
        middleName,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender as Gender,
        grade: grade as Grade,
        stream: (stream as any) || 'A',
        parentId,
        guardianName,
        guardianPhone,
        guardianEmail,
        medicalConditions,
        allergies,
        emergencyContact,
        emergencyPhone,
        bloodGroup,
        address,
        county,
        subCounty,
        previousSchool,
        religion,
        specialNeeds,
        status: 'ACTIVE',
        createdBy: currentUserId,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: learner,
      message: 'Learner created successfully',
    });
  }

  /**
   * Update learner
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async updateLearner(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;

    const learner = await prisma.learner.findUnique({ where: { id } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (learner.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
      if (req.user.branchId && learner.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
    }

    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      grade,
      stream,
      parentId,
      guardianName,
      guardianPhone,
      guardianEmail,
      medicalConditions,
      allergies,
      emergencyContact,
      emergencyPhone,
      bloodGroup,
      address,
      county,
      subCounty,
      status,
      exitDate,
      exitReason,
      previousSchool,
      religion,
      specialNeeds,
    } = req.body;

    // Validate parent if changing
    if (parentId && parentId !== learner.parentId) {
      const parent = await prisma.user.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new ApiError(400, 'Parent user not found');
      }
      if (parent.role !== 'PARENT') {
        throw new ApiError(400, 'Specified user is not a parent');
      }
    }

    // Build update data
    const updateData: any = { updatedBy: currentUserId };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender as Gender;
    if (grade) updateData.grade = grade as Grade;
    if (stream !== undefined) updateData.stream = stream as any;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (guardianName !== undefined) updateData.guardianName = guardianName;
    if (guardianPhone !== undefined) updateData.guardianPhone = guardianPhone;
    if (guardianEmail !== undefined) updateData.guardianEmail = guardianEmail;
    if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (address !== undefined) updateData.address = address;
    if (county !== undefined) updateData.county = county;
    if (subCounty !== undefined) updateData.subCounty = subCounty;
    if (status) updateData.status = status as LearnerStatus;
    if (exitDate) updateData.exitDate = new Date(exitDate);
    if (exitReason !== undefined) updateData.exitReason = exitReason;
    if (previousSchool !== undefined) updateData.previousSchool = previousSchool;
    if (religion !== undefined) updateData.religion = religion;
    if (specialNeeds !== undefined) updateData.specialNeeds = specialNeeds;

    const updatedLearner = await prisma.learner.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedLearner,
      message: 'Learner updated successfully',
    });
  }

  /**
   * Delete learner (soft delete)
   * Access: SUPER_ADMIN, ADMIN
   */
  async deleteLearner(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    const learner = await prisma.learner.findUnique({ where: { id } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (learner.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
      if (req.user.branchId && learner.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
    }

    if (isSuperAdmin) {
      // Hard delete for Super Admin
      await prisma.learner.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Learner permanently deleted by Super Admin',
      });
    } else {
      // Soft delete - mark as archived
      await prisma.learner.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: currentUserId,
          status: 'DROPPED_OUT', // Maintain existing status logic
          exitDate: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Learner archived successfully',
      });
    }
  }

  /**
   * Get learners by grade
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getLearnersByGrade(req: AuthRequest, res: Response) {
    const { grade } = req.params;
    const { stream, status = 'ACTIVE' } = req.query;

    const whereClause: any = {
      grade: grade as Grade,
      status: status as LearnerStatus,
    };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }
    if (req.user?.branchId) {
      whereClause.branchId = req.user.branchId;
    }

    if (stream) {
      whereClause.stream = stream as any;
    }

    const learners = await prisma.learner.findMany({
      where: whereClause,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { stream: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: learners,
      count: learners.length,
      grade,
      stream,
    });
  }

  /**
   * Upload or update learner photo
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async uploadLearnerPhoto(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { photoData } = req.body; // Base64 encoded image
    const currentUserId = req.user!.userId;

    if (!photoData) {
      throw new ApiError(400, 'Photo data is required');
    }

    // Validate base64 format
    if (!photoData.startsWith('data:image/')) {
      throw new ApiError(400, 'Invalid image format. Must be a base64 encoded image');
    }

    const learner = await prisma.learner.findUnique({ where: { id } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      if (learner.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
      if (req.user.branchId && learner.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
    }

    // Update learner with photo
    const updatedLearner = await prisma.learner.update({
      where: { id },
      data: {
        photoUrl: photoData,
        updatedBy: currentUserId,
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: updatedLearner,
    });
  }

  /**
   * Delete learner photo
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async deleteLearnerPhoto(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const currentUserId = req.user!.userId;

    const learner = await prisma.learner.findUnique({ where: { id } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (learner.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
      if (req.user.branchId && learner.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to learner');
      }
    }

    // Remove photo
    const updatedLearner = await prisma.learner.update({
      where: { id },
      data: {
        photoUrl: null,
        photoPublicId: null,
        updatedBy: currentUserId,
      },
    });

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: updatedLearner,
    });
  }

  /**
   * Get parent's children
   * Access: PARENT (own children only)
   */
  async getParentChildren(req: AuthRequest, res: Response) {
    const { parentId } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Parents can only access their own children
    if (currentUserRole === 'PARENT' && parentId !== currentUserId) {
      throw new ApiError(403, 'You can only access your own children');
    }

    const learners = await prisma.learner.findMany({
      where: {
        parentId,
        status: { not: 'DROPPED_OUT' },
      },
      orderBy: [
        { grade: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: learners,
      count: learners.length,
    });
  }

  /**
   * Get learners with birthdays in the current week
   * Access: All authenticated staff
   */
  async getUpcomingBirthdays(req: AuthRequest, res: Response) {
    try {
      const schoolId = req.user?.schoolId;

      const where: any = {
        status: 'ACTIVE',
        archived: false
      };

      if (schoolId) {
        where.schoolId = schoolId;
      }

      // Fetch learners for the current school
      const learners = await prisma.learner.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          grade: true,
          stream: true,
          admissionNumber: true
        }
      });

      const now = new Date();
      // Set to midnight for easier comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const upcoming = learners.filter(l => {
        if (!l.dateOfBirth) return false;

        const dob = new Date(l.dateOfBirth);
        // Normalize birthday to current year
        const bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        // Also check next year (for late December to January transition)
        const bdayNextYear = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());

        return (bdayThisYear >= today && bdayThisYear <= nextWeek) ||
          (bdayNextYear >= today && bdayNextYear <= nextWeek);
      }).map(l => {
        const dob = new Date(l.dateOfBirth!);
        let bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (bday < today) {
          bday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        }

        const diffTime = bday.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: l.id,
          name: `${l.firstName} ${l.lastName}`,
          admissionNumber: l.admissionNumber,
          dateOfBirth: l.dateOfBirth,
          grade: l.grade,
          stream: l.stream,
          daysUntil,
          turningAge: bday.getFullYear() - dob.getFullYear(),
          isToday: daysUntil === 0
        };
      }).sort((a, b) => a.daysUntil - b.daysUntil);

      res.json({
        success: true,
        data: upcoming
      });
    } catch (error: any) {
      console.error('Error fetching birthdays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming birthdays',
        error: error.message
      });
    }
  }
}
