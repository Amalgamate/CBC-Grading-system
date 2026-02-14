/**
 * Class Controller
 * Handles class management and learner enrollment
 * 
 * @module controllers/class.controller
 */

import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';
import { Grade, Term } from '@prisma/client';
import { ConfigService } from '../services/config.service';

const configService = new ConfigService();

export class ClassController {

  /**
   * Helper to get active term context
   */
  private async getActiveContext(schoolId: string) {
    const activeConfig = await configService.getActiveTermConfig(schoolId);
    if (!activeConfig) {
      // Fallback to hardcoded if no config found (prevent system lockout)
      const year = new Date().getFullYear();
      // Simple term logic based on month
      const month = new Date().getMonth(); // 0-11
      let term: Term = 'TERM_1';
      if (month >= 4 && month <= 7) term = 'TERM_2';
      if (month >= 8 && month <= 11) term = 'TERM_3';

      return { academicYear: year, term };
    }
    return { academicYear: activeConfig.academicYear, term: activeConfig.term };
  }

  /**
   * Get all classes
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getAllClasses(req: AuthRequest, res: Response) {
    const { grade, stream, academicYear, term, active = 'true' } = req.query;

    const whereClause: any = {};

    // Phase 5: Tenant Scoping
    if (req.user?.branchId) {
      whereClause.branchId = req.user.branchId;
    } else if (req.user?.schoolId) {
      whereClause.branch = { schoolId: req.user.schoolId };
    }

    if (grade) whereClause.grade = grade as Grade;
    if (stream) whereClause.stream = stream as any;

    // Dynamic Term/Year Resolution if not provided
    if (academicYear) {
      whereClause.academicYear = parseInt(academicYear as string);
    }

    if (term) {
      whereClause.term = term as Term;
    }

    // If neither provided, default to current context ONLY if specific filters aren't requested
    // Actually, usually users want to see *current* classes by default.
    if (!academicYear && !term && req.user?.schoolId) {
      const context = await this.getActiveContext(req.user.schoolId);
      whereClause.academicYear = context.academicYear;
      whereClause.term = context.term;
    }

    if (active) whereClause.active = active === 'true';

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { grade: 'asc' },
        { stream: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: classes,
      count: classes.length,
      context: (whereClause.academicYear && whereClause.term) ? { year: whereClause.academicYear, term: whereClause.term } : 'all-time'
    });
  }

  /**
   * Get single class with enrolled learners
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getClassById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        branch: {
          select: { schoolId: true }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        enrollments: {
          where: { active: true },
          include: {
            learner: {
              select: {
                id: true,
                admissionNumber: true,
                firstName: true,
                lastName: true,
                middleName: true,
                dateOfBirth: true,
                gender: true,
                status: true,
                photoUrl: true
              },
            },
          },
          orderBy: {
            learner: { firstName: 'asc' }
          }
        },
      },
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (classData.branch.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
      if (req.user.branchId && classData.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
    }

    res.json({
      success: true,
      data: classData,
    });
  }

  /**
   * Create new class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async createClass(req: AuthRequest, res: Response) {
    const {
      name,
      grade,
      stream,
      branchId,
      teacherId,
      academicYear,
      term,
      capacity = 40,
      room,
    } = req.body;

    // Phase 5: Tenant Scoping
    let finalBranchId = branchId;
    let schoolId = req.user?.schoolId;

    if (req.user?.branchId) {
      finalBranchId = req.user.branchId;
    } else if (req.user?.schoolId) {
      if (!branchId) throw new ApiError(400, 'branchId is required');
      // Verify branch belongs to school
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch || branch.schoolId !== req.user.schoolId) {
        throw new ApiError(400, 'Invalid branchId for this school');
      }
      finalBranchId = branchId;
    } else {
      // SUPER_ADMIN or no tenant context?
      if (!finalBranchId) throw new ApiError(400, 'branchId is required');
      // Retrieve schoolId from branch if possible
      const branch = await prisma.branch.findUnique({ where: { id: finalBranchId } });
      if (branch) schoolId = branch.schoolId;
    }

    if (!name || !grade) {
      throw new ApiError(400, 'Missing required fields: name, grade');
    }

    // Determine Academic Context
    let finalYear = academicYear;
    let finalTerm = term;

    if ((!finalYear || !finalTerm) && schoolId) {
      const context = await this.getActiveContext(schoolId);
      if (!finalYear) finalYear = context.academicYear;
      if (!finalTerm) finalTerm = context.term;
    }

    // Check if teacher exists
    if (teacherId) {
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
      if (!teacher || teacher.role !== 'TEACHER') {
        throw new ApiError(400, 'Invalid teacher');
      }
      // Phase 5: Check teacher tenant
      if (schoolId && teacher.schoolId !== schoolId) {
        throw new ApiError(400, 'Teacher must belong to the same school');
      }
    }

    // Check for duplicate class in same term
    const existingClass = await prisma.class.findFirst({
      where: {
        branchId: finalBranchId,
        grade: grade as Grade,
        stream: stream || null,
        academicYear: finalYear,
        term: finalTerm as Term
      }
    });

    if (existingClass) {
      throw new ApiError(409, `Class already exists for ${finalYear} ${finalTerm}`);
    }

    const finalStream = stream || 'A';
    const finalName = name || `${grade} ${finalStream}`;

    const newClass = await prisma.class.create({
      data: {
        name: finalName,
        grade: grade as Grade,
        stream: finalStream as any,
        branchId: finalBranchId,
        teacherId,
        academicYear: finalYear,
        term: finalTerm as Term,
        capacity,
        room,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newClass,
      message: 'Class created successfully',
    });
  }

  /**
   * Update class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async updateClass(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, teacherId, capacity, room, active } = req.body;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: { branch: { select: { schoolId: true } } }
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (classData.branch.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
      if (req.user.branchId && classData.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
    }

    // Validate teacher if being assigned/changed
    if (teacherId !== undefined && teacherId !== null) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId }
      });

      if (!teacher) {
        throw new ApiError(404, 'Teacher not found');
      }

      // Phase 5: Teacher Tenant Check
      if (req.user?.schoolId && teacher.schoolId !== req.user.schoolId) {
        throw new ApiError(400, 'Teacher must belong to the same school');
      }

      if (teacher.role !== 'TEACHER' && teacher.role !== 'HEAD_TEACHER') {
        throw new ApiError(400, 'User must have TEACHER or HEAD_TEACHER role');
      }

      if (teacher.status !== 'ACTIVE') {
        throw new ApiError(400, 'Teacher must be in ACTIVE status');
      }

      if (teacher.archived) {
        throw new ApiError(400, 'Cannot assign archived teacher');
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (teacherId !== undefined) updateData.teacherId = teacherId;
    if (capacity) updateData.capacity = capacity;
    if (room !== undefined) updateData.room = room;
    if (active !== undefined) updateData.active = active;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedClass,
      message: 'Class updated successfully',
    });
  }

  /**
   * Enroll learner in class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async enrollLearner(req: AuthRequest, res: Response) {
    const { classId, learnerId } = req.body;

    if (!classId || !learnerId) {
      throw new ApiError(400, 'Missing required fields: classId, learnerId');
    }

    // Check if class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { branch: { select: { schoolId: true } } }
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Phase 5: Class Tenant Check
    if (req.user?.schoolId) {
      if (classData.branch.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
      if (req.user.branchId && classData.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
    }

    // Check if learner exists
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Learner Tenant Check
    if (req.user?.schoolId && learner.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Learner belongs to a different school');
    }

    // Check if already enrolled in ANY active class for this term?
    // Usually learners can only be in one class per term.
    // Let's enforce single active enrollment rule.
    const existingActiveEnrollment = await prisma.classEnrollment.findFirst({
      where: {
        learnerId,
        active: true,
        class: {
          academicYear: classData.academicYear,
          term: classData.term
        }
      },
      include: { class: true }
    });

    if (existingActiveEnrollment && existingActiveEnrollment.classId !== classId) {
      // Enrolled in different class, same term. Should we auto-transfer?
      // For now, blocking and asking to unenroll first is safer to prevent accidents.
      throw new ApiError(400, `Learner is already enrolled in ${existingActiveEnrollment.class.name} for this term.`);
    }

    // Check if already enrolled in THIS class
    const existing = await prisma.classEnrollment.findUnique({
      where: {
        classId_learnerId: {
          classId,
          learnerId,
        },
      },
    });

    if (existing) {
      if (existing.active) {
        throw new ApiError(400, 'Learner is already enrolled in this class');
      }
      // Reactivate enrollment
      const updated = await prisma.classEnrollment.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return res.json({
        success: true,
        data: updated,
        message: 'Learner re-enrolled successfully',
      });
    }

    // Check capacity
    const currentCount = await prisma.classEnrollment.count({
      where: { classId, active: true }
    });

    if (currentCount >= classData.capacity) {
      // Warning but proceed? Or strict block? 
      // Strict block for now.
      throw new ApiError(400, `Class capacity reached (${classData.capacity})`);
    }

    // Create enrollment
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId,
        learnerId,
      },
    });

    return res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Learner enrolled successfully',
    });
  }

  /**
   * Remove learner from class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async unenrollLearner(req: AuthRequest, res: Response) {
    const { classId, learnerId } = req.body;

    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_learnerId: {
          classId,
          learnerId,
        },
      },
      include: {
        class: {
          include: { branch: { select: { schoolId: true } } }
        }
      }
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (enrollment.class.branch.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
      if (req.user.branchId && enrollment.class.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
    }

    await prisma.classEnrollment.update({
      where: { id: enrollment.id },
      data: { active: false },
    });

    res.json({
      success: true,
      message: 'Learner removed from class successfully',
    });
  }

  /**
   * Get learner's current class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT
   */
  async getLearnerClass(req: AuthRequest, res: Response) {
    const { learnerId } = req.params;

    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        learnerId,
        active: true,
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            branch: { select: { schoolId: true } }
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    if (enrollment) {
      // Phase 5: Tenant Check
      if (req.user?.schoolId) {
        if (enrollment.class.branch.schoolId !== req.user.schoolId) {
          // If learner is in another school's class, don't show it? 
          // Or throw error? Since we are querying by learnerId, 
          // we should probably check learner first or just return null if not authorized.
          // But let's throw 403 for safety if we found it but it's wrong tenant.
          throw new ApiError(403, 'Unauthorized access to learner class information');
        }
      }
    }

    res.json({
      success: true,
      data: enrollment,
    });
  }

  /**
   * Assign teacher to class (Dedicated endpoint)
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async assignTeacher(req: AuthRequest, res: Response) {
    const { classId, teacherId } = req.body;

    if (!classId || !teacherId) {
      throw new ApiError(400, 'Both classId and teacherId are required');
    }

    // Validate class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        branch: { select: { schoolId: true } }
      }
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId) {
      if (classData.branch.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
      if (req.user.branchId && classData.branchId !== req.user.branchId) {
        throw new ApiError(403, 'Unauthorized access to class');
      }
    }

    // Validate teacher
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    // Phase 5: Teacher Tenant Check
    if (req.user?.schoolId && teacher.schoolId !== req.user.schoolId) {
      throw new ApiError(400, 'Teacher must belong to the same school');
    }

    if (teacher.role !== 'TEACHER' && teacher.role !== 'HEAD_TEACHER') {
      throw new ApiError(400, 'User must have TEACHER or HEAD_TEACHER role');
    }

    if (teacher.status !== 'ACTIVE') {
      throw new ApiError(400, 'Teacher must be in ACTIVE status');
    }

    if (teacher.archived) {
      throw new ApiError(400, 'Cannot assign archived teacher');
    }

    // Check if teacher is already assigned to this exact class
    if (classData.teacherId === teacherId) {
      return res.json({
        success: true,
        message: 'Teacher is already assigned to this class'
      });
    }

    // Check if teacher is already assigned to another class in same term/year
    const existingAssignments = await prisma.class.findMany({
      where: {
        teacherId: teacherId,
        academicYear: classData.academicYear,
        term: classData.term,
        active: true,
        NOT: { id: classId } // Exclude current class
      },
      select: {
        name: true,
        grade: true,
        stream: true,
      }
    });

    const previousTeacher = classData.teacher;

    // Update class with new teacher
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { teacherId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        _count: {
          select: { enrollments: true }
        }
      },
    });

    res.json({
      success: true,
      data: updatedClass,
      message: `${teacher.firstName} ${teacher.lastName} assigned to ${classData.name} successfully`,
      info: {
        previousTeacher: previousTeacher ? `${previousTeacher.firstName} ${previousTeacher.lastName}` : null,
        otherAssignments: existingAssignments.length > 0 ? existingAssignments : null,
      }
    });
  }

  /**
   * Unassign teacher from class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async unassignTeacher(req: AuthRequest, res: Response) {
    const { classId } = req.body;

    if (!classId) {
      throw new ApiError(400, 'classId is required');
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        branch: { select: { schoolId: true } }
      }
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId && classData.branch.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to class');
    }

    if (!classData.teacherId) {
      throw new ApiError(400, 'No teacher is assigned to this class');
    }

    const previousTeacher = classData.teacher;

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { teacherId: null },
      include: {
        _count: { select: { enrollments: true } }
      },
    });

    res.json({
      success: true,
      data: updatedClass,
      message: `${previousTeacher?.firstName} ${previousTeacher?.lastName} unassigned from ${classData.name}`,
    });
  }

  /**
   * Get teacher's workload (all assigned classes)
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER
   */
  async getTeacherWorkload(req: AuthRequest, res: Response) {
    const { teacherId } = req.params;
    let { academicYear, term } = req.query;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        schoolId: true,
      }
    });

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId && teacher.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to teacher workload');
    }

    // Default to active context if not provided
    if ((!academicYear || !term) && teacher.schoolId) {
      const context = await this.getActiveContext(teacher.schoolId);
      if (!academicYear) academicYear = context.academicYear.toString();
      if (!term) term = context.term;
    }

    const classes = await prisma.class.findMany({
      where: {
        teacherId,
        academicYear: parseInt(academicYear as string),
        term: term as Term,
        active: true,
      },
      include: {
        _count: {
          select: { enrollments: true }
        },
        branch: {
          select: {
            name: true,
            code: true,
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { stream: 'asc' },
      ]
    });

    const totalStudents = classes.reduce(
      (sum, cls) => sum + cls._count.enrollments,
      0
    );

    const workloadLevel = totalStudents > 120 ? 'HIGH' :
      totalStudents > 80 ? 'MEDIUM' :
        totalStudents > 0 ? 'LOW' : 'NONE';

    res.json({
      success: true,
      data: {
        teacher,
        academicYear: parseInt(academicYear as string),
        term,
        classCount: classes.length,
        totalStudents,
        workloadLevel,
        classes: classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          grade: cls.grade,
          stream: cls.stream,
          branch: cls.branch.name,
          studentCount: cls._count.enrollments,
          capacity: cls.capacity,
          utilization: Math.round((cls._count.enrollments / cls.capacity) * 100),
        })),
      }
    });
  }
}
