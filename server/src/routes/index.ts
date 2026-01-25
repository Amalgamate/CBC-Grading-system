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

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/users', userRoutes);
router.use('/learners', learnerRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/reports', reportRoutes);
router.use('/biometric', biometricRoutes); // Biometric attendance endpoints (coming soon)
router.use('/fees', feeRoutes); // Fee management endpoints
router.use('/bulk', bulkRoutes); // Bulk import/export operations
router.use('/cbc', cbcRoutes); // CBC Assessment endpoints (Core Competencies, Values, Co-Curricular)
router.use('/grading', gradingRoutes);
router.use('/config', configRoutes);
router.use('/workflow', workflowRoutes); // ✅ NEW: Workflow & approval system

export default router;
