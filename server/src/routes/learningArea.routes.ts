/**
 * Learning Area Routes
 */

import { Router } from 'express';
import {
  getLearningAreas,
  getLearningArea,
  createLearningArea,
  updateLearningArea,
  deleteLearningArea,
  seedLearningAreas
} from '../controllers/learningArea.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all learning areas for a school
router.get('/', getLearningAreas);

// Get a specific learning area
router.get('/:id', getLearningArea);

// Create a new learning area
router.post('/', createLearningArea);

// Seed default learning areas
router.post('/seed/default', seedLearningAreas);

// Update a learning area
router.put('/:id', updateLearningArea);

// Delete a learning area
router.delete('/:id', deleteLearningArea);

export default router;
