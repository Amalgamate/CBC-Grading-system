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

export class ClassController {
  /**
   * Get all classes
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getAllClasses(req: AuthRequest, res: Response) {
    const { grade, stream, academicYear, term, active = 'true' } = req.query;
    
    const whereClause: any = {};
    
    if (grade) whereClause.grade = grade as Grade;
    if (stream) whereClause.stream = stream as any;
    if (academicYear) whereClause.academicYear = parseInt(academicYear as string);
    if (term) whereClause.term = term as Term;
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
              },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new ApiError(404, 'Class not found');
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
      academicYear = 2025,
      term = 'TERM_1',
      capacity = 40,
      room,
    } = req.body;

    if (!name || !grade || !branchId) {
      throw new ApiError(400, 'Missing required fields: name, grade, branchId');
    }

    // Check if teacher exists
    if (teacherId) {
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
      if (!teacher || teacher.role !== 'TEACHER') {
        throw new ApiError(400, 'Invalid teacher');
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade: grade as Grade,
        stream: stream as any,
        branchId,
        teacherId,
        academicYear,
        term: term as Term,
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

    const classData = await prisma.class.findUnique({ where: { id } });
    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Validate teacher if being assigned/changed
    if (teacherId !== undefined && teacherId !== null) {
      const teacher = await prisma.user.findUnique({ 
        where: { id: teacherId } 
      });
      
      if (!teacher) {
        throw new ApiError(404, 'Teacher not found');
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
    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Check if learner exists
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Check if already enrolled
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
    });

    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
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
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

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
          }
        } 
      }
    });
    
    if (!classData) {
      throw new ApiError(404, 'Class not found');
    }

    // Validate teacher
    const teacher = await prisma.user.findUnique({ 
      where: { id: teacherId } 
    });
    
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
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

    // Check if teacher is already assigned to another class in same term/year
    const existingAssignments = await prisma.class.findMany({
      where: {
        teacherId: teacherId,
        academicYear: classData.academicYear,
        term: classData.term,
        active: true,
        NOT: { id: classId }
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
        }
      }
    });
    
    if (!classData) {
      throw new ApiError(404, 'Class not found');
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
    const { academicYear = '2025', term = 'TERM_1' } = req.query;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
      }
    });

    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
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
