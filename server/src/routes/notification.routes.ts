/**
 * Notification Routes
 * Handles WhatsApp/SMS/Email notification endpoints
 * 
 * @module routes/notification.routes
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireRole } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const notificationController = new NotificationController();

/**
 * @route   POST /api/notifications/assessment-complete
 * @desc    Send assessment completion notification to parent
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/assessment-complete',
  authenticate,
  requirePermission('SEND_MESSAGES'),
  asyncHandler(notificationController.sendAssessmentNotification.bind(notificationController))
);

/**
 * @route   POST /api/notifications/assessment-complete/bulk
 * @desc    Send bulk assessment notifications
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/assessment-complete/bulk',
  authenticate,
  requirePermission('SEND_MESSAGES'),
  asyncHandler(notificationController.sendBulkAssessmentNotifications.bind(notificationController))
);

/**
 * @route   POST /api/notifications/custom
 * @desc    Send custom message to parent
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/custom',
  authenticate,
  requirePermission('SEND_MESSAGES'),
  asyncHandler(notificationController.sendCustomMessage.bind(notificationController))
);

/**
 * @route   POST /api/notifications/announcement
 * @desc    Send announcement to all parents or filtered group
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/announcement',
  authenticate,
  requirePermission('SEND_SCHOOL_NOTICES'),
  asyncHandler(notificationController.sendAnnouncement.bind(notificationController))
);

/**
 * @route   POST /api/notifications/sms/assessment-report
 * @desc    Send assessment report via SMS to parent
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.post(
  '/sms/assessment-report',
  authenticate,
  requirePermission('SEND_MESSAGES'),
  asyncHandler(notificationController.sendAssessmentReportSms.bind(notificationController))
);

/**
 * @route   POST /api/notifications/test
 * @desc    Test WhatsApp connection
 * @access  SUPER_ADMIN, ADMIN
 */
router.post(
  '/test',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  asyncHandler(notificationController.testWhatsApp.bind(notificationController))
);

export default router;
