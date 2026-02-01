import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async.util';
import { sendOTP, verifyOTP } from '../controllers/otp.controller';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

// Public routes with rate limiting
router.post('/register', 
  rateLimit(5, 60_000), // 5 registrations per minute per IP
  asyncHandler(authController.register.bind(authController))
);

router.post('/login', 
  rateLimit(5, 60_000), // 5 login attempts per minute per IP
  asyncHandler(authController.login.bind(authController))
);

// Token refresh
router.post('/refresh', 
  rateLimit(10, 60_000), // 10 refresh attempts per minute
  asyncHandler(authController.refresh.bind(authController))
);

// Password reset flow
router.post('/forgot-password', 
  rateLimit(3, 60_000), // 3 password reset requests per minute
  asyncHandler(authController.forgotPassword.bind(authController))
);

router.post('/reset-password', 
  rateLimit(3, 60_000), // 3 reset attempts per minute
  asyncHandler(authController.resetPassword.bind(authController))
);

// OTP routes
router.post('/otp/send', 
  rateLimit(3, 60_000), // 3 OTP requests per minute
  asyncHandler(sendOTP)
);

router.post('/otp/verify', 
  rateLimit(5, 60_000), // 5 verification attempts per minute
  asyncHandler(verifyOTP)
);

// Verification routes
router.post('/send-whatsapp-verification', 
  rateLimit(3, 60_000),
  asyncHandler(authController.sendWhatsAppVerification.bind(authController))
);

// Development route - Get seeded users
if (process.env.NODE_ENV === 'development') {
  router.get('/seeded-users', asyncHandler(authController.getSeededUsers.bind(authController)));
}

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

router.post('/logout', 
  authenticate, 
  asyncHandler(authController.logout.bind(authController))
);

export default router;
