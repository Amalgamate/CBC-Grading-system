import { Router } from 'express';
import {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
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

// ============================================
// SCHOOL MANAGEMENT ROUTES
// ============================================

// Create a new school
router.post('/', createSchool);

// Get all schools
router.get('/', getAllSchools);

// Get a specific school
router.get('/:id', getSchoolById);

// Update a school
router.put('/:id', updateSchool);

// Delete a school
router.delete('/:id', deleteSchool);

// ============================================
// BRANCH MANAGEMENT ROUTES
// ============================================

// Create a new branch for a school
router.post('/:schoolId/branches', createBranch);

// Get all branches for a school
router.get('/:schoolId/branches', getBranchesBySchool);

// Get a specific branch
router.get('/:schoolId/branches/:branchId', getBranchById);

// Update a branch
router.put('/:schoolId/branches/:branchId', updateBranch);

// Delete a branch
router.delete('/:schoolId/branches/:branchId', deleteBranch);

// ============================================
// ADMISSION SEQUENCE ROUTES
// ============================================

// Get admission sequence status for a school
router.get('/:schoolId/admission-sequence/:academicYear', getAdmissionSequence);

// Get preview of next admission numbers for each branch
router.get('/:schoolId/admission-number-preview/:academicYear', getAdmissionNumberPreview);

// Reset admission sequence (admin only)
router.post('/:schoolId/reset-sequence', resetAdmissionSequence);

export default router;
