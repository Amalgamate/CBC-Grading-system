
import express from 'express';
import {
    getCommunicationConfig,
    saveCommunicationConfig,
    sendTestSms,
    sendTestEmail,
    getBirthdaysToday,
    sendBirthdayWishes,
    getBroadcastRecipients,
    getStaffContacts,
    createContactGroup,
    getContactGroups,
    getContactGroupById,
    updateContactGroup,
    deleteContactGroup
} from '../controllers/communication.controller';
import { requireRole } from '../middleware/permissions.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';

const router = express.Router();

/**
 * Apply authentication and tenant middleware to all routes
 */
router.use(authenticate);
router.use(requireTenant);

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

// Send Test Email
// Allowed: Admin, Super Admin
router.post(
    '/test/email',
    requireRole(['SUPER_ADMIN', 'ADMIN']),
    sendTestEmail
);

// Birthday Birthdays Today
// Allowed: Admin, Super Admin, Head Teacher
router.get(
    '/birthdays/today/:schoolId',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
    getBirthdaysToday
);

// Send Birthday Wishes
// Allowed: Admin, Super Admin, Head Teacher
// Send Birthday Wishes
// Allowed: Admin, Super Admin, Head Teacher
router.post(
    '/birthdays/send',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
    sendBirthdayWishes
);

// Get Broadcast Recipients
// Allowed: Admin, Super Admin, Head Teacher
router.get(
    '/recipients',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
    getBroadcastRecipients
);

// Get Staff Contacts
// Allowed: Admin, Super Admin, Head Teacher, Teacher
router.get(
    '/staff',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    getStaffContacts
);

// Contact Groups Routes
// Get all contact groups
router.get(
    '/groups',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    getContactGroups
);

// Get contact group by ID
router.get(
    '/groups/:id',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    getContactGroupById
);

// Create contact group
router.post(
    '/groups',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    createContactGroup
);

// Update contact group
router.put(
    '/groups/:id',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    updateContactGroup
);

// Delete contact group
router.delete(
    '/groups/:id',
    requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER']),
    deleteContactGroup
);

export default router;
