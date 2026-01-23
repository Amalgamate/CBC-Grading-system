import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async.util';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register.bind(authController)));

router.post('/login', asyncHandler(authController.login.bind(authController)));

// Verification routes
router.post('/send-whatsapp-verification', asyncHandler(authController.sendWhatsAppVerification.bind(authController)));

// Development route - Get seeded users
if (process.env.NODE_ENV === 'development') {
  router.get('/seeded-users', asyncHandler(authController.getSeededUsers.bind(authController)));
}

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

export default router;
