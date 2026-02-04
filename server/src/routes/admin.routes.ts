import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permissions.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const admin = new AdminController();

router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// School Management
router.get('/schools', admin.listSchools);
router.post('/schools/provision', admin.provisionSchool); // New: Complete school setup
router.get('/schools/deleted', admin.listDeletedSchools); // New: List soft-deleted schools
router.get('/schools/:schoolId/statistics', admin.getSchoolStatistics); // New: Detailed stats
router.delete('/schools/:schoolId', admin.deleteSchoolWithOptions); // Enhanced: With options
router.post('/schools/:schoolId/restore', admin.restoreSchool); // New: Restore deleted school
router.get('/schools/:schoolId/communication', admin.getSchoolCommunication); // New: Manage school SMS/Email/Mpesa
router.put('/schools/:schoolId/communication', admin.updateSchoolCommunication);

// Subscription & Plans
router.get('/plans', admin.listPlans);
router.patch('/schools/:schoolId/reactivate', admin.reactivateSchool);
router.patch('/schools/:schoolId/approve-payment', admin.approvePayment);

// Metrics & Modules
router.get('/trials/metrics', admin.trialMetrics);
router.get('/schools/:schoolId/modules', admin.getSchoolModules);
router.patch('/schools/:schoolId/modules/:moduleKey', admin.setSchoolModule);

// Context Switching
router.post('/switch-school/:schoolId', admin.switchSchool);

export default router;
