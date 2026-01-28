import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { enforceSchoolConsistency, requireTenant } from '../middleware/tenant.middleware';
import {
  createSchool,
  createSchoolWithProvisioning,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  deactivateSchool,
  createBranch,
  getBranchesBySchool,
  getBranchById,
  updateBranch,
  deleteBranch,
  getAdmissionSequence,
  getAdmissionNumberPreview,
  resetAdmissionSequence
} from '../controllers/school.controller';

const router = Router();

// Protect all routes
router.use(authenticate);
router.use(requireTenant);
// router.use(enforceSchoolConsistency); // Now applied per-route where needed or global if safe

// ============================================
// SCHOOL MANAGEMENT ROUTES
// ============================================

// Create a new school with COMPLETE PROVISIONING (RECOMMENDED)
router.post('/provision', createSchoolWithProvisioning);

// Create a new school (basic - without admin user/subscription)
router.post('/', createSchool);

// Get all schools
router.get('/', getAllSchools);

// Get a specific school
router.get('/:id', getSchoolById);

// Update a school
router.put('/:id', updateSchool);
router.patch('/:id', updateSchool);

// Delete a school
router.delete('/:id', deleteSchool);

// Deactivate a school
router.post('/:schoolId/deactivate', enforceSchoolConsistency, deactivateSchool);

// ============================================
// BRANCH MANAGEMENT ROUTES
// ============================================

// Create a new branch for a school
router.post('/:schoolId/branches', enforceSchoolConsistency, createBranch);

// Get all branches for a school
router.get('/:schoolId/branches', enforceSchoolConsistency, getBranchesBySchool);

// Get a specific branch
router.get('/:schoolId/branches/:branchId', enforceSchoolConsistency, getBranchById);

// Update a branch
router.put('/:schoolId/branches/:branchId', enforceSchoolConsistency, updateBranch);

// Delete a branch
router.delete('/:schoolId/branches/:branchId', enforceSchoolConsistency, deleteBranch);

// ============================================
// ADMISSION SEQUENCE ROUTES
// ============================================

// Get admission sequence status for a school
router.get('/:schoolId/admission-sequence/:academicYear', enforceSchoolConsistency, getAdmissionSequence);

// Get preview of next admission numbers for each branch
router.get('/:schoolId/admission-number-preview/:academicYear', enforceSchoolConsistency, getAdmissionNumberPreview);

// Reset admission sequence (admin only)
router.post('/:schoolId/reset-sequence', enforceSchoolConsistency, resetAdmissionSequence);

export default router;
