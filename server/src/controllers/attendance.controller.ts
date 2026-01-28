/**
 * Attendance Controller
 * Handles attendance marking and reporting
 * 
 * @module controllers/attendance.controller
 */

import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceController {
  /**
   * Mark attendance for a single learner
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async markAttendance(req: AuthRequest, res: Response) {
    const currentUserId = req.user!.userId;
    const { learnerId, date, status, classId, remarks } = req.body;

    if (!learnerId || !date || !status) {
      throw new ApiError(400, 'Missing required fields: learnerId, date, status');
    }

    // Check if learner exists
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
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

    // Parse date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already marked for this date
    const existing = await prisma.attendance.findUnique({
      where: {
        learnerId_date: {
          learnerId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: status as AttendanceStatus,
          classId,
          remarks,
          markedBy: currentUserId,
          markedAt: new Date(),
        },
        include: {
          learner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: updated,
        message: 'Attendance updated successfully',
      });
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        learnerId,
        date: attendanceDate,
        status: status as AttendanceStatus,
        classId,
        remarks,
        markedBy: currentUserId,
      },
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully',
    });
  }

  /**
   * Mark attendance for multiple learners (bulk)
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async markBulkAttendance(req: AuthRequest, res: Response) {
    const currentUserId = req.user!.userId;
    const { attendanceRecords, date, classId } = req.body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords) || !date) {
      throw new ApiError(400, 'Missing required fields: attendanceRecords (array), date');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
        // If classId is provided, verify it belongs to tenant
        if (classId) {
            const classObj = await prisma.class.findUnique({ 
                where: { id: classId },
                include: { branch: true }
            });
            
            if (!classObj) {
                throw new ApiError(404, 'Class not found');
            }

            if (classObj.branch.schoolId !== req.user.schoolId) {
                throw new ApiError(403, 'Unauthorized access to class');
            }

            if (req.user.branchId && classObj.branchId !== req.user.branchId) {
                throw new ApiError(403, 'Unauthorized access to class');
            }
        }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each attendance record
    for (const record of attendanceRecords) {
      try {
        const { learnerId, status, remarks } = record;

        if (!learnerId || !status) {
          results.failed++;
          results.errors.push({ learnerId, error: 'Missing learnerId or status' });
          continue;
        }

        // Check if already exists
        const existing = await prisma.attendance.findUnique({
          where: {
            learnerId_date: {
              learnerId,
              date: attendanceDate,
            },
          },
        });

        if (existing) {
          // Update
          await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              status: status as AttendanceStatus,
              classId,
              remarks,
              markedBy: currentUserId,
              markedAt: new Date(),
            },
          });
          results.updated++;
        } else {
          // Create
          await prisma.attendance.create({
            data: {
              learnerId,
              date: attendanceDate,
              status: status as AttendanceStatus,
              classId,
              remarks,
              markedBy: currentUserId,
            },
          });
          results.created++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({ learnerId: record.learnerId, error: error.message });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Attendance marked: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
    });
  }

  /**
   * Get attendance records
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getAttendance(req: AuthRequest, res: Response) {
    const { date, startDate, endDate, learnerId, classId, status } = req.query;

    const whereClause: any = {};

    if (date) {
      const queryDate = new Date(date as string);
      queryDate.setHours(0, 0, 0, 0);
      whereClause.date = queryDate;
    }

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    if (learnerId) whereClause.learnerId = learnerId;
    if (classId) whereClause.classId = classId;
    if (status) whereClause.status = status as AttendanceStatus;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
        whereClause.learner = {
            schoolId: req.user.schoolId
        };
        if (req.user.branchId) {
            whereClause.learner.branchId = req.user.branchId;
        }
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        learner: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            grade: true,
            stream: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { learner: { lastName: 'asc' } },
      ],
    });

    res.json({
      success: true,
      data: attendance,
      count: attendance.length,
    });
  }

  /**
   * Get attendance statistics
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getAttendanceStats(req: AuthRequest, res: Response) {
    const { startDate, endDate, classId, learnerId } = req.query;

    const whereClause: any = {};

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    if (classId) whereClause.classId = classId;
    if (learnerId) whereClause.learnerId = learnerId;

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
        whereClause.learner = {
            schoolId: req.user.schoolId
        };
        if (req.user.branchId) {
            whereClause.learner.branchId = req.user.branchId;
        }
    }

    // Get counts by status
    const statusCounts = await prisma.attendance.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    // Get total unique days with attendance
    const uniqueDates = await prisma.attendance.findMany({
      where: whereClause,
      select: { date: true },
      distinct: ['date'],
    });

    // Get total unique learners
    const uniqueLearners = await prisma.attendance.findMany({
      where: whereClause,
      select: { learnerId: true },
      distinct: ['learnerId'],
    });

    // Calculate attendance rate
    const presentCount = statusCounts.find(s => s.status === 'PRESENT')?._count || 0;
    const totalCount = statusCounts.reduce((sum, item) => sum + item._count, 0);

    const stats = {
      totalRecords: totalCount,
      totalDays: uniqueDates.length,
      totalLearners: uniqueLearners.length,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      attendanceRate: totalCount > 0 
        ? Math.round((presentCount / totalCount) * 100) 
        : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }

  /**
   * Get learner attendance summary
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT (own children)
   */
  async getLearnerAttendanceSummary(req: AuthRequest, res: Response) {
    const { learnerId } = req.params;
    const { startDate, endDate } = req.query;

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Check permissions
    if (currentUserRole === 'PARENT') {
      const learner = await prisma.learner.findUnique({
        where: { id: learnerId },
      });
      if (!learner || learner.parentId !== currentUserId) {
        throw new ApiError(403, 'You can only access your own children\'s attendance');
      }
    }

    // Phase 5: Tenant Scoping (for non-parents)
    if (currentUserRole !== 'PARENT' && req.user?.schoolId) {
        const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
        
        if (!learner) {
             throw new ApiError(404, 'Learner not found');
        }

        if (learner.schoolId !== req.user.schoolId) {
             throw new ApiError(403, 'Unauthorized access to learner');
        }
        if (req.user.branchId && learner.branchId !== req.user.branchId) {
             throw new ApiError(403, 'Unauthorized access to learner');
        }
    }

    const whereClause: any = { learnerId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    // Get all attendance records
    const records = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    // Calculate summary
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      excused: records.filter(r => r.status === 'EXCUSED').length,
      sick: records.filter(r => r.status === 'SICK').length,
      attendanceRate: 0,
    };

    summary.attendanceRate = summary.total > 0 
      ? Math.round((summary.present / summary.total) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        summary,
        records,
      },
    });
  }

  /**
   * Get daily attendance report for a class
   * Access: SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
   */
  async getDailyClassAttendance(req: AuthRequest, res: Response) {
    const { classId, date } = req.query;

    if (!classId || !date) {
      throw new ApiError(400, 'Missing required parameters: classId, date');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
        const classObj = await prisma.class.findUnique({ 
             where: { id: classId as string },
             include: { branch: true }
        });
        
        if (!classObj) {
            throw new ApiError(404, 'Class not found');
        }

        if (classObj.branch.schoolId !== req.user.schoolId) {
            throw new ApiError(403, 'Unauthorized access to class');
        }

        if (req.user.branchId && classObj.branchId !== req.user.branchId) {
            throw new ApiError(403, 'Unauthorized access to class');
        }
    }

    const queryDate = new Date(date as string);
    queryDate.setHours(0, 0, 0, 0);

    // Get all enrolled learners in the class
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId: classId as string,
        active: true,
      },
      include: {
        learner: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
          },
        },
      },
    });

    // Get attendance for this date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId: classId as string,
        date: queryDate,
      },
    });

    // Create map of learner attendance
    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[record.learnerId] = record;
      return acc;
    }, {} as Record<string, any>);

    // Combine learner list with attendance
    const report = enrollments.map(enrollment => ({
      ...enrollment.learner,
      attendance: attendanceMap[enrollment.learner.id] || null,
    }));

    res.json({
      success: true,
      data: {
        date: queryDate,
        classId,
        totalLearners: enrollments.length,
        marked: attendanceRecords.length,
        unmarked: enrollments.length - attendanceRecords.length,
        learners: report,
      },
    });
  }
}
