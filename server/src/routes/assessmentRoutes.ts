/**
 * Assessment Routes
 * Routes for formative and summative assessments
 */

import express from 'express';
import * as assessmentController from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';

const router = express.Router();

// ============================================
// FORMATIVE ASSESSMENT ROUTES
// ============================================

router.post('/formative', authenticate, requireTenant, assessmentController.createFormativeAssessment);

router.get('/formative', authenticate, requireTenant, assessmentController.getFormativeAssessments);

router.get(
  '/formative/learner/:learnerId',
  authenticate,
  requireTenant,
  assessmentController.getFormativeByLearner
);

router.delete('/formative/:id', authenticate, requireTenant, assessmentController.deleteFormativeAssessment);

// ============================================
// SUMMATIVE TEST ROUTES
// ============================================

router.post('/tests', authenticate, requireTenant, assessmentController.createSummativeTest);

router.get('/tests', authenticate, requireTenant, assessmentController.getSummativeTests);

router.get('/tests/:id', authenticate, requireTenant, assessmentController.getSummativeTest);

router.put('/tests/:id', authenticate, requireTenant, assessmentController.updateSummativeTest);

router.delete('/tests/:id', authenticate, requireTenant, assessmentController.deleteSummativeTest);

// ============================================
// SUMMATIVE RESULT ROUTES
// ============================================

router.post('/summative/results', authenticate, requireTenant, assessmentController.recordSummativeResult);

router.post('/summative/results/bulk', authenticate, requireTenant, assessmentController.recordSummativeResultsBulk);

router.get(
  '/summative/results/learner/:learnerId',
  authenticate,
  requireTenant,
  assessmentController.getSummativeByLearner
);

router.get(
  '/summative/results/test/:testId',
  authenticate,
  requireTenant,
  assessmentController.getTestResults
);

export default router;
