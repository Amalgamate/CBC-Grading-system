import { Router } from 'express';
import { FeeTypeController } from '../controllers/feeType.controller';
import { requireRole, auditLog } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();

// ============================================
// FEE TYPE ROUTES
// ============================================

/**
 * @route   GET /api/fees/types
 * @desc    Get all fee types
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.get(
    '/',
    requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
    asyncHandler(FeeTypeController.getAll)
);

/**
 * @route   POST /api/fees/types
 * @desc    Create fee type
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.post(
    '/',
    requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
    auditLog('CREATE_FEE_TYPE'),
    asyncHandler(FeeTypeController.create)
);

/**
 * @route   PUT /api/fees/types/:id
 * @desc    Update fee type
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.put(
    '/:id',
    requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
    auditLog('UPDATE_FEE_TYPE'),
    asyncHandler(FeeTypeController.update)
);

/**
 * @route   POST /api/fees/types/seed/defaults
 * @desc    Seed default fee types for school
 * @access  ADMIN, SUPER_ADMIN
 */
router.post(
    '/seed/defaults',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    auditLog('SEED_FEE_TYPES'),
    asyncHandler(FeeTypeController.seedDefaults)
);

/**
 * @route   POST /api/fees/types/seed/structures
 * @desc    Seed default fee structures for all grades and terms
 * @access  ADMIN, SUPER_ADMIN
 */
router.post(
    '/seed/structures',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    auditLog('SEED_FEE_STRUCTURES'),
    asyncHandler(FeeTypeController.seedStructures)
);

/**
 * @route   DELETE /api/fees/types/:id
 * @desc    Delete fee type
 * @access  ADMIN, SUPER_ADMIN
 */
router.delete(
    '/:id',
    requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
    auditLog('DELETE_FEE_TYPE'),
    asyncHandler(FeeTypeController.delete)
);

export default router;
