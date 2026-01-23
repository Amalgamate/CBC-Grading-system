/**
 * Learner Routes
 * Handles learner management endpoints with role-based access control
 * 
 * @module routes/learner.routes
 */

import { Router } from 'express';
import { LearnerController } from '../controllers/learner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireRole, auditLog } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const learnerController = new LearnerController();

/**
 * @route   GET /api/learners
 * @desc    Get all learners (filtered by role)
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT (own children)
 */
router.get(
  '/',
  authenticate,
  requirePermission('VIEW_ALL_LEARNERS'),
  asyncHandler(learnerController.getAllLearners.bind(learnerController))
);

/**
 * @route   GET /api/learners/stats
 * @desc    Get learner statistics
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.get(
  '/stats',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  asyncHandler(learnerController.getLearnerStats.bind(learnerController))
);

/**
 * @route   GET /api/learners/grade/:grade
 * @desc    Get learners by grade
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/grade/:grade',
  authenticate,
  requirePermission('VIEW_ALL_LEARNERS'),
  asyncHandler(learnerController.getLearnersByGrade.bind(learnerController))
);

/**
 * @route   GET /api/learners/parent/:parentId
 * @desc    Get learner's children
 * @access  PARENT (own children), SUPER_ADMIN, ADMIN
 */
router.get(
  '/parent/:parentId',
  authenticate,
  requirePermission('VIEW_OWN_CHILDREN'),
  asyncHandler(learnerController.getParentChildren.bind(learnerController))
);

/**
 * @route   GET /api/learners/admission/:admissionNumber
 * @desc    Get learner by admission number
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/admission/:admissionNumber',
  authenticate,
  requirePermission('VIEW_ALL_LEARNERS'),
  asyncHandler(learnerController.getLearnerByAdmissionNumber.bind(learnerController))
);

/**
 * @route   GET /api/learners/:id
 * @desc    Get single learner
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT (own child)
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(learnerController.getLearnerById.bind(learnerController))
);

/**
 * @route   POST /api/learners
 * @desc    Create new learner
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/',
  authenticate,
  requirePermission('CREATE_LEARNER'),
  auditLog('CREATE_LEARNER'),
  asyncHandler(learnerController.createLearner.bind(learnerController))
);

/**
 * @route   PUT /api/learners/:id
 * @desc    Update learner
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('EDIT_LEARNER'),
  auditLog('UPDATE_LEARNER'),
  asyncHandler(learnerController.updateLearner.bind(learnerController))
);

/**
 * @route   DELETE /api/learners/:id
 * @desc    Delete learner (soft delete)
 * @access  SUPER_ADMIN, ADMIN
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('DELETE_LEARNER'),
  auditLog('DELETE_LEARNER'),
  asyncHandler(learnerController.deleteLearner.bind(learnerController))
);

/**
 * @route   POST /api/learners/:id/photo
 * @desc    Upload or update learner photo
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/:id/photo',
  authenticate,
  requirePermission('EDIT_LEARNER'),
  auditLog('UPLOAD_LEARNER_PHOTO'),
  asyncHandler(learnerController.uploadLearnerPhoto.bind(learnerController))
);

/**
 * @route   DELETE /api/learners/:id/photo
 * @desc    Delete learner photo
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.delete(
  '/:id/photo',
  authenticate,
  requirePermission('EDIT_LEARNER'),
  auditLog('DELETE_LEARNER_PHOTO'),
  asyncHandler(learnerController.deleteLearnerPhoto.bind(learnerController))
);

export default router;
