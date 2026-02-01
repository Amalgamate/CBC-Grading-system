import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import learnerRoutes from './learner.routes';
import classRoutes from './class.routes';
import attendanceRoutes from './attendance.routes';
import notificationRoutes from './notification.routes';
import assessmentRoutes from './assessmentRoutes';
import reportRoutes from './reportRoutes';
import biometricRoutes from './biometric.routes';
import schoolRoutes from './school.routes';
import feeRoutes from './fee.routes';
import bulkRoutes from './bulk';
import cbcRoutes from './cbcRoutes';
import gradingRoutes from './grading.routes';
import configRoutes from './config.routes';
import workflowRoutes from './workflow.routes';
import communicationRoutes from './communication.routes';
import adminRoutes from './admin.routes';
import learningAreaRoutes from './learningArea.routes';
import { checkSchoolActive } from '../middleware/trial.guard';
import onboardingRoutes from './onboarding.routes';
import { issueCsrfToken } from '../middleware/csrf.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';
import tenantRoutes from './tenant.routes';
import { enforcePortalTenantMatch } from '../middleware/portalTenant.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes); // Public onboarding endpoints
router.use('/tenants', tenantRoutes); // Public tenant branding endpoints
router.get('/auth/csrf', issueCsrfToken);

// ============================================
// PROTECTED ROUTES (Authenticated & Tenant-Aware)
// ============================================
// These routes require authentication and proper trial status check
router.use(authenticate);
router.use(enforcePortalTenantMatch);

// Admin routes must come BEFORE requireTenant middleware
// because super admins need access to ALL schools
router.use('/admin', adminRoutes);

// Apply tenant middleware to all other routes
router.use(requireTenant);

router.use('/schools', schoolRoutes);
router.use('/users', userRoutes);
router.use('/learners', checkSchoolActive, learnerRoutes);
router.use('/classes', checkSchoolActive, classRoutes);
router.use('/attendance', checkSchoolActive, attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assessments', checkSchoolActive, assessmentRoutes);
router.use('/reports', checkSchoolActive, reportRoutes);
router.use('/biometric', biometricRoutes);
router.use('/fees', checkSchoolActive, feeRoutes);
router.use('/bulk', checkSchoolActive, bulkRoutes);
router.use('/cbc', cbcRoutes);
router.use('/grading', checkSchoolActive, gradingRoutes);
router.use('/config', checkSchoolActive, configRoutes);
router.use('/learning-areas', checkSchoolActive, learningAreaRoutes);
router.use('/workflow', workflowRoutes);
router.use('/communication', checkSchoolActive, communicationRoutes);

export default router;
