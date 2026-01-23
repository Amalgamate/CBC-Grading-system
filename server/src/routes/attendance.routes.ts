/**
 * Attendance Routes
 * Handles attendance marking and reporting endpoints
 * 
 * @module routes/attendance.routes
 */

import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, auditLog } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const attendanceController = new AttendanceController();

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance for single learner
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/',
  authenticate,
  requirePermission('MARK_ATTENDANCE'),
  auditLog('MARK_ATTENDANCE'),
  asyncHandler(attendanceController.markAttendance.bind(attendanceController))
);

/**
 * @route   POST /api/attendance/bulk
 * @desc    Mark attendance for multiple learners
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/bulk',
  authenticate,
  requirePermission('MARK_ATTENDANCE'),
  auditLog('MARK_BULK_ATTENDANCE'),
  asyncHandler(attendanceController.markBulkAttendance.bind(attendanceController))
);

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/',
  authenticate,
  requirePermission('VIEW_ALL_ATTENDANCE'),
  asyncHandler(attendanceController.getAttendance.bind(attendanceController))
);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/stats',
  authenticate,
  requirePermission('VIEW_ALL_ATTENDANCE'),
  asyncHandler(attendanceController.getAttendanceStats.bind(attendanceController))
);

/**
 * @route   GET /api/attendance/learner/:learnerId
 * @desc    Get learner attendance summary
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT (own children)
 */
router.get(
  '/learner/:learnerId',
  authenticate,
  asyncHandler(attendanceController.getLearnerAttendanceSummary.bind(attendanceController))
);

/**
 * @route   GET /api/attendance/class/daily
 * @desc    Get daily attendance report for a class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/class/daily',
  authenticate,
  requirePermission('VIEW_ALL_ATTENDANCE'),
  asyncHandler(attendanceController.getDailyClassAttendance.bind(attendanceController))
);

export default router;
