/**
 * Assessment Routes
 * Routes for formative and summative assessments
 */

import express from 'express';
import * as assessmentController from '../controllers/assessmentController';
import * as setupController from '../controllers/setupController';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';

const router = express.Router();

// ============================================
// FORMATIVE ASSESSMENT ROUTES
// ============================================

router.post('/formative', authenticate, requireTenant, assessmentController.createFormativeAssessment);
router.post('/formative/bulk', authenticate, requireTenant, assessmentController.recordFormativeResultsBulk);

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
router.post('/tests/bulk', authenticate, requireTenant, assessmentController.generateTestsBulk);

router.get('/tests', authenticate, requireTenant, assessmentController.getSummativeTests);

router.get('/tests/:id', authenticate, requireTenant, assessmentController.getSummativeTest);

router.put('/tests/:id', authenticate, requireTenant, assessmentController.updateSummativeTest);

router.delete('/tests/bulk', authenticate, requireTenant, assessmentController.deleteSummativeTestsBulk);
router.delete('/tests/:id', authenticate, requireTenant, assessmentController.deleteSummativeTest);

// ============================================
// SUMMATIVE RESULT ROUTES
// ============================================

router.post('/summative/results', authenticate, requireTenant, assessmentController.recordSummativeResult);

router.post('/summative/results/bulk', authenticate, requireTenant, assessmentController.recordSummativeResultsBulk);

router.get(
  '/summative/results/bulk',
  authenticate,
  requireTenant,
  assessmentController.getBulkSummativeResults
);

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

// ============================================
// SCHOOL SETUP ROUTES - BULK OPERATIONS
// ============================================
// These endpoints help administrators quickly set up grading scales and tests for the entire school
// WARNING: These are powerful operations that should only be available to admins/principals

router.post('/setup/create-scales', authenticate, requireTenant, setupController.bulkCreateGradingScales);
router.post('/setup/create-tests', authenticate, requireTenant, setupController.bulkCreateSummativeTests);
router.post('/setup/complete', authenticate, requireTenant, setupController.completeSchoolSetup);

export default router;
