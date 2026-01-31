
import express from 'express';
import { getCommunicationConfig, saveCommunicationConfig, sendTestSms } from '../controllers/communication.controller';
import { requireRole } from '../middleware/permissions.middleware';

const router = express.Router();

/**
 * Communication Routes
 * Base path: /api/communication (defined in index.ts)
 */

// Get Configuration
// Allowed: Admin, Super Admin, Head Teacher
router.get(
    '/config/:schoolId',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
    getCommunicationConfig
);

// Save Configuration
// Allowed: Admin, Super Admin
router.post(
    '/config',
    requireRole(['SUPER_ADMIN', 'ADMIN']),
    saveCommunicationConfig
);

// Send Test SMS
// Allowed: Admin, Super Admin, Head Teacher
router.post(
    '/test/sms',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
    sendTestSms
);

export default router;
