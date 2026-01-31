/**
 * Workflow Routes
 * API routes for assessment workflow operations
 */

import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  canPerformWorkflowAction,
  preventSelfApproval,
  requireReason,
  approvalChecks,
  lockChecks,
  unlockChecks
} from '../middleware/workflow.authorization';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ============================================
// WORKFLOW ACTION ROUTES
// ============================================

/**
 * POST /api/workflow/submit
 * Submit assessment for approval
 * Body: { assessmentId, assessmentType: 'formative' | 'summative', comments? }
 */
router.post(
  '/submit',
  canPerformWorkflowAction('submit'),
  workflowController.submitForApproval
);

/**
 * POST /api/workflow/approve/:type/:id
 * Approve assessment
 * Body: { comments? }
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.post(
  '/approve/:type/:id',
  canPerformWorkflowAction('approve'),
  preventSelfApproval,
  workflowController.approveAssessment
);

/**
 * POST /api/workflow/reject/:type/:id
 * Reject assessment and send back to draft
 * Body: { reason: string } (required)
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.post(
  '/reject/:type/:id',
  canPerformWorkflowAction('reject'),
  requireReason(10),
  workflowController.rejectAssessment
);

/**
 * POST /api/workflow/publish/:type/:id
 * Publish assessment (make visible to students/parents)
 * Body: { comments? }
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.post(
  '/publish/:type/:id',
  canPerformWorkflowAction('publish'),
  workflowController.publishAssessment
);

/**
 * POST /api/workflow/lock/:type/:id
 * Lock assessment (prevent all edits)
 * Body: { reason? }
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.post(
  '/lock/:type/:id',
  ...lockChecks,
  workflowController.lockAssessment
);

/**
 * POST /api/workflow/unlock/:type/:id
 * Unlock assessment (admin emergency action)
 * Body: { reason: string } (required, min 10 chars)
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.post(
  '/unlock/:type/:id',
  ...unlockChecks,
  workflowController.unlockAssessment
);

// ============================================
// QUERY ROUTES
// ============================================

/**
 * GET /api/workflow/pending
 * Get pending approvals for current user
 * Only shows assessments that the user can approve based on their role
 */
router.get(
  '/pending',
  workflowController.getPendingApprovals
);

/**
 * GET /api/workflow/history/:type/:id
 * Get workflow history for an assessment
 * Shows all status changes with timestamps and actors
 * Params: type = 'formative' | 'summative', id = assessmentId
 */
router.get(
  '/history/:type/:id',
  workflowController.getWorkflowHistory
);

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * POST /api/workflow/bulk-lock
 * Bulk lock all published assessments for a term
 * Body: { schoolId, term, academicYear, reason }
 * Requires ADMIN role
 */
router.post(
  '/bulk-lock',
  canPerformWorkflowAction('lock'),
  requireReason(20),
  workflowController.bulkLockTermAssessments
);

/**
 * POST /api/workflow/bulk-approve
 * Bulk approve assessments
 * Body: { ids, assessmentType, comments }
 * Requires appropriate role
 */
router.post(
  '/bulk-approve',
  canPerformWorkflowAction('approve'),
  workflowController.bulkApproveAssessments
);

export default router;
