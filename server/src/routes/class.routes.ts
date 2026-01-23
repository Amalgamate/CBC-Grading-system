/**
 * Class Routes
 * Handles class management and enrollment endpoints
 * 
 * @module routes/class.routes
 */

import { Router } from 'express';
import { ClassController } from '../controllers/class.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireRole, auditLog } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const classController = new ClassController();

/**
 * @route   GET /api/classes
 * @desc    Get all classes
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/',
  authenticate,
  requirePermission('VIEW_ALL_LEARNERS'),
  asyncHandler(classController.getAllClasses.bind(classController))
);

/**
 * @route   GET /api/classes/:id
 * @desc    Get single class with learners
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER
 */
router.get(
  '/:id',
  authenticate,
  requirePermission('VIEW_ALL_LEARNERS'),
  asyncHandler(classController.getClassById.bind(classController))
);

/**
 * @route   POST /api/classes
 * @desc    Create new class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  auditLog('CREATE_CLASS'),
  asyncHandler(classController.createClass.bind(classController))
);

/**
 * @route   PUT /api/classes/:id
 * @desc    Update class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.put(
  '/:id',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  auditLog('UPDATE_CLASS'),
  asyncHandler(classController.updateClass.bind(classController))
);

/**
 * @route   POST /api/classes/enroll
 * @desc    Enroll learner in class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/enroll',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  auditLog('ENROLL_LEARNER'),
  asyncHandler(classController.enrollLearner.bind(classController))
);

/**
 * @route   POST /api/classes/unenroll
 * @desc    Remove learner from class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER
 */
router.post(
  '/unenroll',
  authenticate,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER']),
  auditLog('UNENROLL_LEARNER'),
  asyncHandler(classController.unenrollLearner.bind(classController))
);

/**
 * @route   GET /api/classes/learner/:learnerId
 * @desc    Get learner's current class
 * @access  SUPER_ADMIN, ADMIN, HEAD_TEACHER, TEACHER, PARENT
 */
router.get(
  '/learner/:learnerId',
  authenticate,
  asyncHandler(classController.getLearnerClass.bind(classController))
);

export default router;
