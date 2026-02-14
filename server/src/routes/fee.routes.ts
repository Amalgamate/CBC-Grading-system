/**
 * Fee Management Routes
 * Handles fee structures, invoices, and payments
 */

import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, auditLog } from '../middleware/permissions.middleware';
import { requireTenant } from '../middleware/tenant.middleware';
import { asyncHandler } from '../utils/async.util';

import feeTypeRoutes from './feeType.routes';

const router = Router();
const feeController = new FeeController();

router.use(authenticate, requireTenant);

// ============================================
// FEE TYPE ROUTES
// ============================================
router.use('/types', feeTypeRoutes);

// ============================================
// FEE STRUCTURE ROUTES
// ============================================

/**
 * @route   GET /api/fees/structures
 * @desc    Get all fee structures
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.get(
  '/structures',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  asyncHandler(feeController.getAllFeeStructures)
);

/**
 * @route   POST /api/fees/structures
 * @desc    Create fee structure
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.post(
  '/structures',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  auditLog('CREATE_FEE_STRUCTURE'),
  asyncHandler(feeController.createFeeStructure)
);

/**
 * @route   PUT /api/fees/structures/:id
 * @desc    Update fee structure
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.put(
  '/structures/:id',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  auditLog('UPDATE_FEE_STRUCTURE'),
  asyncHandler(feeController.updateFeeStructure)
);

/**
 * @route   DELETE /api/fees/structures/:id
 * @desc    Delete fee structure
 * @access  ADMIN, SUPER_ADMIN
 */
router.delete(
  '/structures/:id',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  auditLog('DELETE_FEE_STRUCTURE'),
  asyncHandler(feeController.deleteFeeStructure)
);

// ============================================
// INVOICE ROUTES
// ============================================

/**
 * @route   GET /api/fees/invoices
 * @desc    Get all invoices (with filters)
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.get(
  '/invoices',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  asyncHandler(feeController.getAllInvoices)
);

/**
 * @route   GET /api/fees/invoices/learner/:learnerId
 * @desc    Get invoices for specific learner
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN, PARENT (own child)
 */
router.get(
  '/invoices/learner/:learnerId',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'PARENT']),
  asyncHandler(feeController.getLearnerInvoices)
);

/**
 * @route   POST /api/fees/invoices
 * @desc    Create invoice
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.post(
  '/invoices',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  auditLog('CREATE_INVOICE'),
  asyncHandler(feeController.createInvoice)
);

/**
 * @route   POST /api/fees/invoices/bulk
 * @desc    Bulk generate invoices for class/grade
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.post(
  '/invoices/bulk',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  auditLog('BULK_CREATE_INVOICES'),
  asyncHandler(feeController.bulkGenerateInvoices)
);

// ============================================
// PAYMENT ROUTES
// ============================================

/**
 * @route   POST /api/fees/payments
 * @desc    Record payment
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.post(
  '/payments',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  auditLog('RECORD_PAYMENT'),
  asyncHandler(feeController.recordPayment)
);

/**
 * @route   GET /api/fees/stats
 * @desc    Get payment statistics
 * @access  ACCOUNTANT, ADMIN, SUPER_ADMIN
 */
router.get(
  '/stats',
  requireRole(['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN']),
  asyncHandler(feeController.getPaymentStats)
);

export default router;
