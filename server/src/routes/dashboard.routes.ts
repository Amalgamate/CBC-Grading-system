import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes are protected
router.use(authenticate);

router.get('/admin', asyncHandler(dashboardController.getAdminMetrics.bind(dashboardController)));
router.get('/teacher', asyncHandler(dashboardController.getTeacherMetrics.bind(dashboardController)));

export default router;
