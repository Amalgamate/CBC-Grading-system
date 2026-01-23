/**
 * CBC Assessment Routes
 * Routes for Core Competencies, Values, and Co-Curricular Activities
 */

import express from 'express';
import * as cbcController from '../controllers/cbcController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Core Competencies
router.post('/competencies', authenticate, cbcController.createOrUpdateCompetencies);
router.get('/competencies/:learnerId', authenticate, cbcController.getCompetenciesByLearner);

// Values Assessment
router.post('/values', authenticate, cbcController.createOrUpdateValues);
router.get('/values/:learnerId', authenticate, cbcController.getValuesByLearner);

// Co-Curricular Activities
router.post('/cocurricular', authenticate, cbcController.createCoCurricular);
router.get('/cocurricular/:learnerId', authenticate, cbcController.getCoCurricularByLearner);
router.put('/cocurricular/:id', authenticate, cbcController.updateCoCurricular);
router.delete('/cocurricular/:id', authenticate, cbcController.deleteCoCurricular);

// Termly Report Comments
router.post('/comments', authenticate, cbcController.saveReportComments);
router.get('/comments/:learnerId', authenticate, cbcController.getCommentsByLearner);

export default router;
