import { Router } from 'express';
import { PlannerController } from '../controllers/planner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';

const router = Router();
const controller = new PlannerController();

// Apply auth middleware to all routes
router.use(authenticate);

// Get all events
router.get('/events', controller.getEvents);

// Create event (Admin, Head Teacher, Teacher)
router.post(
    '/events',

    (req, res, next) => {
        const role = req.user?.role;
        if (['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER'].includes(role || '')) {
            next();
        } else {
            res.status(403).json({ success: false, error: 'Access denied' });
        }
    },
    controller.createEvent
);

// Update event
router.put(
    '/events/:id',
    (req, res, next) => {
        const role = req.user?.role;
        if (['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER'].includes(role || '')) {
            next();
        } else {
            res.status(403).json({ success: false, error: 'Access denied' });
        }
    },
    controller.updateEvent
);

// Delete event
router.delete(
    '/events/:id',
    (req, res, next) => {
        const role = req.user?.role;
        if (['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER'].includes(role || '')) {
            next();
        } else {
            res.status(403).json({ success: false, error: 'Access denied' });
        }
    },
    controller.deleteEvent
);

export default router;
