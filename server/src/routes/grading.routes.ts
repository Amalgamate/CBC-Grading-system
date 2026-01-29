import { Router } from 'express';
import { gradingController } from '../controllers/grading.controller';
import * as scaleGroupController from '../controllers/scaleGroup.controller';
import { enforceSchoolConsistency, requireTenant } from '../middleware/tenant.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication and tenant resolution for consistency
router.use(authenticate);
router.use(requireTenant);
// router.use(enforceSchoolConsistency);

// Scale Group Routes
router.get('/scale-groups', scaleGroupController.getScaleGroups);
router.get('/scale-groups/:id', scaleGroupController.getScaleGroupById);
router.post('/scale-groups', scaleGroupController.createScaleGroup);
router.put('/scale-groups/:id', scaleGroupController.updateScaleGroup);
router.delete('/scale-groups/:id', scaleGroupController.deleteScaleGroup);
router.post('/scale-groups/:id/generate-grades', scaleGroupController.generateGradesForScaleGroup);
router.get('/scale-groups/:id/for-test', scaleGroupController.getScaleForTest);

// Grading System Routes
router.get('/school/:schoolId', enforceSchoolConsistency, gradingController.getGradingSystems);
router.post('/system', gradingController.createGradingSystem);
router.put('/system/:id', gradingController.updateGradingSystem);
router.delete('/system/:id', gradingController.deleteGradingSystem);

router.put('/range/:id', gradingController.updateGradingRange);
router.post('/range', gradingController.createGradingRange);
router.delete('/range/:id', gradingController.deleteGradingRange);

export default router;
