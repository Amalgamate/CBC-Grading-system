/**
 * Assessment Routes
 * Routes for formative and summative assessments
 */

import express from 'express';
import * as assessmentController from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================
// FORMATIVE ASSESSMENT ROUTES
// ============================================

// Create or update formative assessment
router.post(
  '/formative',
  authenticate,
  assessmentController.createFormativeAssessment
);

// Get all formative assessments (with filters)
router.get(
  '/formative',
  authenticate,
  assessmentController.getFormativeAssessments
);

// Get formative assessments for a specific learner
router.get(
  '/formative/learner/:learnerId',
  authenticate,
  assessmentController.getFormativeByLearner
);

// Delete formative assessment
router.delete(
  '/formative/:id',
  authenticate,
  assessmentController.deleteFormativeAssessment
);

// ============================================
// SUMMATIVE TEST ROUTES
// ============================================

// Create summative test
router.post(
  '/tests',
  authenticate,
  assessmentController.createSummativeTest
);

// Get all summative tests (with filters)
router.get(
  '/tests',
  authenticate,
  assessmentController.getSummativeTests
);

// Get single summative test with results
router.get(
  '/tests/:id',
  authenticate,
  assessmentController.getSummativeTest
);

// Update summative test
router.put(
  '/tests/:id',
  authenticate,
  assessmentController.updateSummativeTest
);

// Delete summative test
router.delete(
  '/tests/:id',
  authenticate,
  assessmentController.deleteSummativeTest
);

// ============================================
// SUMMATIVE RESULT ROUTES
// ============================================

// Record summative result (marks)
router.post(
  '/summative/results',
  authenticate,
  assessmentController.recordSummativeResult
);

// Get summative results for a learner
router.get(
  '/summative/results/learner/:learnerId',
  authenticate,
  assessmentController.getSummativeByLearner
);

// Get all results for a specific test
router.get(
  '/summative/results/test/:testId',
  authenticate,
  assessmentController.getTestResults
);

export default router;
