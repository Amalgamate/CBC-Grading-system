/**
 * Bulk Operations Router Index
 * Combines all bulk operation routes
 */

import { Router } from 'express';
import learnersRouter from './learners.bulk';
import teachersRouter from './teachers.bulk';
import parentsRouter from './parents.bulk';

const router = Router();

// Mount sub-routers
router.use('/learners', learnersRouter);
router.use('/teachers', teachersRouter);
router.use('/parents', parentsRouter);

export default router;
