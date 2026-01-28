/**
 * Configuration Controller
 * Handles HTTP requests for term and aggregation configurations
 * Uses ConfigService for business logic
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { configService } from '../services/config.service';
import { calculationService } from '../services/calculation.service';
import { Term, FormativeAssessmentType, Grade, AggregationStrategy } from '@prisma/client';

// ============================================
// TERM CONFIGURATION ENDPOINTS
// ============================================

/**
 * GET /api/config/term/:schoolId
 * Get all term configurations for a school
 */
export const getTermConfigs = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const configs = await configService.getSchoolTermConfigs(schoolId);

    res.json({
      success: true,
      data: configs
    });
  } catch (error: any) {
    console.error('Error fetching term configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch term configurations',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/config/term/:schoolId/:term/:year
 * Get specific term configuration (creates default if missing)
 */
export const getSpecificTermConfig = async (req: Request, res: Response) => {
  try {
    const { schoolId, term, year } = req.params;

    const config = await configService.getTermConfig({
      schoolId,
      term: term as Term,
      academicYear: parseInt(year)
    });

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Error fetching term config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch term configuration',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/config/term/active/:schoolId
 * Get active term configuration
 */
export const getActiveTermConfig = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const config = await configService.getActiveTermConfig(schoolId);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No active term configuration found'
        }
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Error fetching active term config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch active term configuration',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/term
 * Create or update term configuration (upsert)
 */
export const upsertTermConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }

    const {
      schoolId,
      academicYear,
      term,
      startDate,
      endDate,
      formativeWeight,
      summativeWeight,
      isActive
    } = req.body;

    const config = await configService.upsertTermConfig({
      schoolId,
      academicYear: parseInt(academicYear),
      term,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      formativeWeight: parseFloat(formativeWeight),
      summativeWeight: parseFloat(summativeWeight),
      isActive: Boolean(isActive),
      createdBy: userId
    });

    res.json({
      success: true,
      message: 'Term configuration saved successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error upserting term config:', error);

    if (error.message.includes('Weights must sum to 100')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEIGHTS',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: 'Failed to save term configuration',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/config/term/:id
 * Update existing term configuration
 */
export const updateTermConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      formativeWeight,
      summativeWeight,
      isActive,
      isClosed
    } = req.body;

    const updateData: any = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (formativeWeight !== undefined) updateData.formativeWeight = parseFloat(formativeWeight);
    if (summativeWeight !== undefined) updateData.summativeWeight = parseFloat(summativeWeight);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isClosed !== undefined) updateData.isClosed = Boolean(isClosed);

    const config = await configService.updateTermConfig(id, updateData);

    res.json({
      success: true,
      message: 'Term configuration updated successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error updating term config:', error);

    if (error.message.includes('Weights must sum to 100')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WEIGHTS',
          message: error.message
        }
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Term configuration not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update term configuration',
        details: error.message
      }
    });
  }
};

// ============================================
// AGGREGATION CONFIGURATION ENDPOINTS
// ============================================

/**
 * GET /api/config/aggregation/:schoolId
 * Get all aggregation configurations for a school
 */
export const getAggregationConfigs = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const configs = await configService.getSchoolAggregationConfigs(schoolId);

    res.json({
      success: true,
      data: configs
    });
  } catch (error: any) {
    console.error('Error fetching aggregation configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch aggregation configurations',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/config/aggregation/:schoolId/:assessmentType
 * Get aggregation config for specific assessment type
 */
export const getSpecificAggregationConfig = async (req: Request, res: Response) => {
  try {
    const { schoolId, assessmentType } = req.params;
    const { grade, learningArea } = req.query;

    const config = await configService.getAggregationConfig({
      schoolId,
      assessmentType: assessmentType as FormativeAssessmentType,
      grade: grade as Grade | undefined,
      learningArea: learningArea as string | undefined
    });

    if (!config) {
      return res.json({
        success: true,
        data: {
          strategy: 'SIMPLE_AVERAGE',
          message: 'No specific configuration found, using default'
        }
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Error fetching aggregation config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch aggregation configuration',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/aggregation
 * Create new aggregation configuration
 */
export const createAggregationConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }

    const {
      schoolId,
      grade,
      learningArea,
      type,
      strategy,
      nValue,
      weight
    } = req.body;

    const config = await configService.createAggregationConfig({
      schoolId,
      grade,
      learningArea,
      type,
      strategy,
      nValue: nValue ? parseInt(nValue) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      message: 'Aggregation configuration created successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error creating aggregation config:', error);

    if (error.message.includes('requires')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STRATEGY',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create aggregation configuration',
        details: error.message
      }
    });
  }
};

/**
 * PUT /api/config/aggregation/:id
 * Update aggregation configuration
 */
export const updateAggregationConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { strategy, nValue, weight } = req.body;

    const updateData: any = {};
    if (strategy) updateData.strategy = strategy;
    if (nValue !== undefined) updateData.nValue = nValue ? parseInt(nValue) : null;
    if (weight !== undefined) updateData.weight = parseFloat(weight);

    const config = await configService.updateAggregationConfig(id, updateData);

    res.json({
      success: true,
      message: 'Aggregation configuration updated successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error updating aggregation config:', error);

    if (error.message.includes('requires')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STRATEGY',
          message: error.message
        }
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Aggregation configuration not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update aggregation configuration',
        details: error.message
      }
    });
  }
};

/**
 * DELETE /api/config/aggregation/:id
 * Delete aggregation configuration
 */
export const deleteAggregationConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await configService.deleteAggregationConfig(id);

    res.json({
      success: true,
      message: 'Aggregation configuration deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting aggregation config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete aggregation configuration',
        details: error.message
      }
    });
  }
};

// ============================================
// STREAM CONFIGURATION ENDPOINTS
// ============================================

/**
 * GET /api/config/streams/:schoolId
 * Get all stream configurations for a school
 */
export const getStreamConfigs = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const configs = await configService.getStreamConfigs(schoolId);

    res.json({
      success: true,
      data: configs
    });
  } catch (error: any) {
    console.error('Error fetching stream configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch stream configurations',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/streams
 * Create or update stream configuration
 */
export const upsertStreamConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { id, name, active } = req.body;
    let { schoolId } = req.body;
    if (!schoolId) {
      schoolId = req.user?.schoolId || undefined as any;
    }

    if (!schoolId || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'School ID and Name are required'
        }
      });
    }

    const config = await configService.upsertStreamConfig({
      id,
      schoolId,
      name,
      active
    });

    res.json({
      success: true,
      message: 'Stream configuration saved successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error saving stream config:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: 'Failed to save stream configuration',
        details: error.message
      }
    });
  }
};

/**
 * DELETE /api/config/streams/:id
 * Delete stream configuration
 */
export const deleteStreamConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await configService.deleteStreamConfig(id);

    res.json({
      success: true,
      message: 'Stream configuration deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting stream config:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete stream configuration',
        details: error.message
      }
    });
  }
};

// ============================================
// UTILITY ENDPOINTS
// ============================================

/**
 * GET /api/config/summary/:schoolId
 * Get configuration summary for dashboard
 */
export const getConfigurationSummary = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const summary = await configService.getConfigurationSummary(schoolId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Error fetching configuration summary:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch configuration summary',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/config/strategies
 * Get available aggregation strategies
 */
export const getAvailableStrategies = async (req: Request, res: Response) => {
  try {
    const strategies = calculationService.getAvailableStrategies();

    res.json({
      success: true,
      data: strategies
    });
  } catch (error: any) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch available strategies',
        details: error.message
      }
    });
  }
};

/**
 * GET /api/config/grades
 * Get list of all valid grades from schema
 */
export const getGrades = async (req: Request, res: Response) => {
  try {
    // Get all enum values
    const grades = Object.values(Grade);

    res.json({
      success: true,
      data: grades
    });
  } catch (error: any) {
    console.error('Error fetching grades:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch grades',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/reset-defaults
 * Reset configurations to defaults
 */
export const resetToDefaults = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }

    const { schoolId, term, academicYear } = req.body;

    const config = await configService.resetToDefaults({
      schoolId,
      term,
      academicYear: parseInt(academicYear),
      userId
    });

    res.json({
      success: true,
      message: 'Configurations reset to defaults successfully',
      data: config
    });
  } catch (error: any) {
    console.error('Error resetting to defaults:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_ERROR',
        message: 'Failed to reset configurations',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/create-defaults
 * Create default aggregation configs for common assessment types
 */
export const createDefaultAggregationConfigs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }

    const { schoolId } = req.body;

    const configs = await configService.createDefaultAggregationConfigs(schoolId, userId);

    res.status(201).json({
      success: true,
      message: 'Default aggregation configurations created successfully',
      data: configs
    });
  } catch (error: any) {
    console.error('Error creating default configs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create default configurations',
        details: error.message
      }
    });
  }
};

/**
 * POST /api/config/recalculate-class
 * Recalculate all scores for a class
 */
export const recalculateClassScores = async (req: Request, res: Response) => {
  try {
    const { classId, term, academicYear } = req.body;

    const result = await calculationService.recalculateClassScores({
      classId,
      term,
      academicYear: parseInt(academicYear)
    });

    res.json({
      success: true,
      message: `Recalculated scores for ${result.updated} learners`,
      data: result
    });
  } catch (error: any) {
    console.error('Error recalculating scores:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RECALCULATION_ERROR',
        message: 'Failed to recalculate scores',
        details: error.message
      }
    });
  }
};

// ============================================
// EXPORT CONTROLLER
// ============================================

export const configController = {
  // Term config
  getTermConfigs,
  getSpecificTermConfig,
  getActiveTermConfig,
  upsertTermConfig,
  updateTermConfig,

  // Aggregation config
  getAggregationConfigs,
  getSpecificAggregationConfig,
  createAggregationConfig,
  updateAggregationConfig,
  deleteAggregationConfig,

  // Stream config
  getStreamConfigs,
  upsertStreamConfig,
  deleteStreamConfig,

  // Utilities
  getConfigurationSummary,
  getAvailableStrategies,
  resetToDefaults,
  createDefaultAggregationConfigs,
  recalculateClassScores,
  getGrades
};
