/**
 * Configuration Routes
 * API routes for term and aggregation configurations
 */

import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateTermConfig,
  validateAggregationConfig,
  validateCompleteTermConfig,
  validateCompleteAggregationConfig
} from '../middleware/config.validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ============================================
// TERM CONFIGURATION ROUTES
// ============================================

/**
 * GET /api/config/term/:schoolId
 * Get all term configurations for a school
 */
router.get('/term/:schoolId', configController.getTermConfigs);

/**
 * GET /api/config/term/:schoolId/:term/:year
 * Get specific term configuration (creates default if missing)
 */
router.get('/term/:schoolId/:term/:year', configController.getSpecificTermConfig);

/**
 * GET /api/config/term/active/:schoolId
 * Get active term configuration
 */
router.get('/term/active/:schoolId', configController.getActiveTermConfig);

/**
 * POST /api/config/term
 * Create or update term configuration
 * Validates: weights sum to 100, dates valid, etc.
 */
router.post(
  '/term',
  validateCompleteTermConfig,
  configController.upsertTermConfig
);

/**
 * PUT /api/config/term/:id
 * Update existing term configuration
 * Validates: weights if provided
 */
router.put(
  '/term/:id',
  validateTermConfig,
  configController.updateTermConfig
);

// ============================================
// AGGREGATION CONFIGURATION ROUTES
// ============================================

/**
 * GET /api/config/aggregation/:schoolId
 * Get all aggregation configurations for a school
 */
router.get('/aggregation/:schoolId', configController.getAggregationConfigs);

/**
 * GET /api/config/aggregation/:schoolId/:assessmentType
 * Get aggregation config for specific assessment type
 * Optional query params: grade, learningArea
 */
router.get(
  '/aggregation/:schoolId/:assessmentType',
  configController.getSpecificAggregationConfig
);

/**
 * POST /api/config/aggregation
 * Create new aggregation configuration
 * Validates: strategy params match strategy type
 */
router.post(
  '/aggregation',
  validateCompleteAggregationConfig,
  configController.createAggregationConfig
);

/**
 * PUT /api/config/aggregation/:id
 * Update aggregation configuration
 * Validates: strategy params
 */
router.put(
  '/aggregation/:id',
  validateAggregationConfig,
  configController.updateAggregationConfig
);

/**
 * DELETE /api/config/aggregation/:id
 * Delete aggregation configuration
 */
router.delete('/aggregation/:id', configController.deleteAggregationConfig);

// ============================================
// STREAM CONFIGURATION ROUTES
// ============================================

/**
 * GET /api/config/streams/:schoolId
 * Get all stream configurations for a school
 */
router.get('/streams/:schoolId', configController.getStreamConfigs);

/**
 * POST /api/config/streams
 * Create or update stream configuration
 */
router.post('/streams', configController.upsertStreamConfig);

/**
 * DELETE /api/config/streams/:id
 * Delete stream configuration
 */
router.delete('/streams/:id', configController.deleteStreamConfig);

// ============================================
// UTILITY ROUTES
// ============================================

/**
 * GET /api/config/summary/:schoolId
 * Get configuration summary for dashboard
 */
router.get('/summary/:schoolId', configController.getConfigurationSummary);

/**
 * GET /api/config/strategies
 * Get available aggregation strategies with descriptions
 */
router.get('/strategies', configController.getAvailableStrategies);

/**
 * POST /api/config/reset-defaults
 * Reset configurations to defaults for a term
 * Body: { schoolId, term, academicYear }
 */
router.post('/reset-defaults', configController.resetToDefaults);

/**
 * POST /api/config/create-defaults
 * Create default aggregation configs for common assessment types
 * Body: { schoolId }
 */
router.post('/create-defaults', configController.createDefaultAggregationConfigs);

/**
 * POST /api/config/recalculate-class
 * Recalculate all scores for a class when configuration changes
 * Body: { classId, term, academicYear }
 */
router.post('/recalculate-class', configController.recalculateClassScores);

export default router;
