import { Router } from 'express';
import { gradingController } from '../controllers/grading.controller';
import { enforceSchoolConsistency, requireTenant } from '../middleware/tenant.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication and tenant resolution for consistency
router.use(authenticate);
router.use(requireTenant);
// router.use(enforceSchoolConsistency);

router.get('/school/:schoolId', enforceSchoolConsistency, gradingController.getGradingSystems);
router.post('/system', gradingController.createGradingSystem);
router.put('/system/:id', gradingController.updateGradingSystem);
router.delete('/system/:id', gradingController.deleteGradingSystem);

router.put('/range/:id', gradingController.updateGradingRange);
router.post('/range', gradingController.createGradingRange);
router.delete('/range/:id', gradingController.deleteGradingRange);

export default router;
