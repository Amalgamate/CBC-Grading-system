/**
 * Stream Routes
 * Facility Management - Stream Management Endpoints
 * Base path: /api/facility/streams
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';
import { StreamController } from '../controllers/stream.controller';

const router = Router();
const controller = new StreamController();

/**
 * @route   GET /api/facility/streams
 * @query   branchId (required)
 * @desc    Get all streams for a branch
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.get(
  '/',
  authenticate,
  asyncHandler((req, res) => controller.getStreamsByBranch(req, res))
);

/**
 * @route   GET /api/facility/streams/:streamId
 * @desc    Get single stream by ID
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.get(
  '/:streamId',
  authenticate,
  asyncHandler((req, res) => controller.getStream(req, res))
);

/**
 * @route   GET /api/facility/streams/branch/:branchId/available
 * @desc    Get available stream names for a branch
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.get(
  '/branch/:branchId/available',
  authenticate,
  asyncHandler((req, res) => controller.getAvailableStreamNames(req, res))
);

/**
 * @route   POST /api/facility/streams
 * @desc    Create new stream
 * @access  SUPER_ADMIN, ADMIN
 * @body    { branchId: string, name: string }
 */
router.post(
  '/',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  asyncHandler((req, res) => controller.createStream(req, res))
);

/**
 * @route   PUT /api/facility/streams/:streamId
 * @desc    Update stream
 * @access  SUPER_ADMIN, ADMIN
 * @body    { name?: string, active?: boolean }
 */
router.put(
  '/:streamId',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  asyncHandler((req, res) => controller.updateStream(req, res))
);

/**
 * @route   DELETE /api/facility/streams/:streamId
 * @desc    Archive stream (soft delete)
 * @access  SUPER_ADMIN, ADMIN
 */
router.delete(
  '/:streamId',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  asyncHandler((req, res) => controller.deleteStream(req, res))
);

export default router;
