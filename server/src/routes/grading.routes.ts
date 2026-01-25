import { Router } from 'express';
import { gradingController } from '../controllers/grading.controller';

const router = Router();

router.get('/school/:schoolId', gradingController.getGradingSystems);
router.post('/system', gradingController.createGradingSystem);
router.put('/system/:id', gradingController.updateGradingSystem);
router.delete('/system/:id', gradingController.deleteGradingSystem);

router.put('/range/:id', gradingController.updateGradingRange);
router.post('/range', gradingController.createGradingRange);
router.delete('/range/:id', gradingController.deleteGradingRange);

export default router;
