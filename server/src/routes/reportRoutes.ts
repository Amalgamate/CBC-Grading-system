/**
 * Report Routes
 * Routes for comprehensive assessment reports and analytics
 */

import express from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================
// FORMATIVE REPORT
// ============================================

/**
 * Get comprehensive formative report for a learner
 * GET /api/reports/formative/:learnerId?term=TERM_1&academicYear=2026
 */
router.get(
  '/formative/:learnerId',
  authenticate,
  reportController.getFormativeReport
);

// ============================================
// SUMMATIVE REPORT
// ============================================

/**
 * Get comprehensive summative report for a learner
 * GET /api/reports/summative/:learnerId?term=TERM_1&academicYear=2026
 */
router.get(
  '/summative/:learnerId',
  authenticate,
  reportController.getSummativeReport
);

// ============================================
// TERMLY REPORT (COMPREHENSIVE)
// ============================================

/**
 * Get complete termly report combining all assessments
 * GET /api/reports/termly/:learnerId?term=TERM_1&academicYear=2026
 */
router.get(
  '/termly/:learnerId',
  authenticate,
  reportController.getTermlyReport
);

// ============================================
// ANALYTICS
// ============================================

/**
 * Get class-level performance analytics
 * GET /api/reports/analytics/class/:classId?term=TERM_1&academicYear=2026
 */
router.get(
  '/analytics/class/:classId',
  authenticate,
  reportController.getClassAnalytics
);

/**
 * Get individual learner analytics (year-long progress)
 * GET /api/reports/analytics/learner/:learnerId?academicYear=2026
 */
router.get(
  '/analytics/learner/:learnerId',
  authenticate,
  reportController.getLearnerAnalytics
);

export default router;
