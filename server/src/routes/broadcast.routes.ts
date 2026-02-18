import express from 'express';
import {
  saveBroadcastCampaign,
  getBroadcastHistory,
  getBroadcastDetails,
  getBroadcastStats,
  saveSmsDeliveryLog,
  deleteBroadcastCampaign
} from '../controllers/broadcast.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/permissions.middleware';

const router = express.Router();

/**
 * Apply authentication and tenant middleware to all routes
 */
router.use(authenticate);
router.use(requireTenant);

/**
 * Broadcast Routes
 * Base path: /api/broadcasts
 */

// Save broadcast campaign after sending
// Allowed: Admin, Super Admin, Head Teacher
router.post(
  '/',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  saveBroadcastCampaign
);

// Get broadcast history
// Allowed: Admin, Super Admin, Head Teacher
router.get(
  '/',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  getBroadcastHistory
);

// Get broadcast stats
// Allowed: Admin, Super Admin, Head Teacher
router.get(
  '/stats/:schoolId',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  getBroadcastStats
);

// Get broadcast details
// Allowed: Admin, Super Admin, Head Teacher
router.get(
  '/:campaignId',
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  getBroadcastDetails
);

// Save SMS delivery log
// Allowed: Admin, Super Admin
router.post(
  '/:campaignId/delivery-logs',
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  saveSmsDeliveryLog
);

// Delete broadcast campaign
// Allowed: Admin, Super Admin
router.delete(
  '/:campaignId',
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  deleteBroadcastCampaign
);

export default router;
