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
 * @route   DELETE /api/fees/types/:id
 * @desc    Delete fee type
 * @access  ADMIN, SUPER_ADMIN
 */
router.delete(
    '/:id',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    auditLog('DELETE_FEE_TYPE'),
    asyncHandler(FeeTypeController.delete)
);

export default router;
