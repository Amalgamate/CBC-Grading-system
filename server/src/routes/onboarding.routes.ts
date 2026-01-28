import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { requireCsrf } from '../middleware/csrf.middleware';

const router = Router();
const ctrl = new OnboardingController();

// Public endpoint: no auth required
router.post('/register-school', rateLimit(10, 60_000), ctrl.registerSchool);
router.post('/register-full', rateLimit(5, 60_000), requireCsrf, ctrl.registerFull);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/verify-phone', rateLimit(10, 60_000), ctrl.verifyPhone);
router.get('/branch-options', ctrl.getBranchOptionsByEmail);

export default router;
