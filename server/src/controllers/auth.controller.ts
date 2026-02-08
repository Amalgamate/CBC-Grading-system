import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { ApiError } from '../utils/error.util';
import { Role, canManageRole } from '../config/permissions';
import { AuthRequest } from '../middleware/permissions.middleware';
import { validatePassword, DEFAULT_PASSWORD_POLICY, PARENT_PASSWORD_POLICY, passwordsMatch } from '../utils/password.util';
import { EmailService } from '../services/email-resend.service';

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    const { email, password, firstName, lastName, role, phone, schoolId, branchId } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if this is an authenticated request (user creating another user)
    const isAuthenticatedCreation = !!req.user;
    const requestedRole = (role || 'TEACHER') as Role;

    // If authenticated, check if user can create this role
    if (isAuthenticatedCreation) {
      const currentUserRole = req.user!.role;

      if (!canManageRole(currentUserRole, requestedRole)) {
        throw new ApiError(403, `You cannot create users with role: ${requestedRole}`);
      }

      // Additional check: Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN
      if (['SUPER_ADMIN', 'ADMIN'].includes(requestedRole) && currentUserRole !== 'SUPER_ADMIN') {
        throw new ApiError(403, 'Only SUPER_ADMIN can create admin users');
      }
    } else {
      // Public registration - only allow PARENT role by default
      // This can be configured based on your needs
      if (role && role !== 'PARENT') {
        throw new ApiError(403, 'Public registration is only allowed for parent accounts');
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    // Validate password strength using unified utility
    const passwordPolicy = requestedRole === 'PARENT' ? PARENT_PASSWORD_POLICY : DEFAULT_PASSWORD_POLICY;
    const passwordValidation = validatePassword(password, passwordPolicy);

    if (!passwordValidation.valid) {
      throw new ApiError(400, passwordValidation.errors.join(', '));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine school and branch for new user
    let finalSchoolId = schoolId;
    let finalBranchId = branchId;

    // If creating user from authenticated context, inherit school/branch if not specified
    if (isAuthenticatedCreation && !finalSchoolId && req.user!.schoolId) {
      finalSchoolId = req.user!.schoolId;
    }
    if (isAuthenticatedCreation && !finalBranchId && req.user!.branchId) {
      finalBranchId = req.user!.branchId;
    }

    // SUPER_ADMIN doesn't need school/branch
    if (requestedRole === 'SUPER_ADMIN') {
      finalSchoolId = null;
      finalBranchId = null;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: requestedRole,
        phone: phone || null,
        emailVerified: false,
        schoolId: finalSchoolId || null,
        branchId: finalBranchId || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        schoolId: true,
        branchId: true,
        createdAt: true
      }
    });

    // Send Welcome Email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = finalSchoolId
      ? `${frontendUrl}/t/${finalSchoolId}/login`
      : `${frontendUrl}/login`;

    EmailService.sendWelcomeEmail({
      to: email,
      schoolName: 'EDucore Platform', // Or fetch school name if we had it handy, but for speed 'EDucore Platform' works or we can make it optional
      adminName: `${firstName} ${lastName}`,
      loginUrl,
      schoolId: finalSchoolId || undefined
    }).catch(err => console.error('Failed to send welcome email:', err));

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      user,
      token: accessToken,
      refreshToken,
      message: 'User registered successfully'
    });
  }

  async login(req: Request, res: Response) {
    const { email, password, tenantSchoolId } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user with school and branch info
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is locked (graceful handling for missing column)
    try {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new ApiError(403, `Account locked. Try again in ${minutesLeft} minutes`);
      }
    } catch (error: any) {
      // If column doesn't exist, continue anyway
      if (!error.message?.includes('does not exist')) {
        throw error;
      }
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts (graceful handling for missing column)
      try {
        const newAttempts = (user.loginAttempts || 0) + 1;
        const lockAccount = newAttempts >= 5;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(user.hasOwnProperty('loginAttempts') && { loginAttempts: newAttempts }),
            ...(user.hasOwnProperty('lockedUntil') && { lockedUntil: lockAccount ? new Date(Date.now() + 15 * 60 * 1000) : null }),
          }
        });

        if (lockAccount) {
          throw new ApiError(403, 'Too many failed login attempts. Account locked for 15 minutes');
        }
      } catch (error: any) {
        // If columns don't exist, just fail login without account locking
        if (error.message?.includes('does not exist')) {
          throw new ApiError(401, 'Invalid credentials');
        }
        throw error;
      }

      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is not active');
    }

    // Tenant-first enforcement:
    // For non-SUPER_ADMIN users, validate school context
    if (user.role !== 'SUPER_ADMIN') {
      if (!user.schoolId) {
        throw new ApiError(403, 'No school association found. Please contact support.');
      }

      // If tenantSchoolId is provided, validate it matches
      if (tenantSchoolId && user.schoolId !== tenantSchoolId) {
        throw new ApiError(403, 'Wrong school portal for this account. Please use your school login link.');
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login and reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
      message: 'Login successful'
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token required');
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new ApiError(401, 'Account is not active');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        token: newAccessToken,
        refreshToken: newRefreshToken,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: {
          select: { name: true }
        }
      }
    });

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = randomUUID();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry
      }
    });

    // Determine reset URL based on school
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = user.schoolId
      ? `${frontendUrl}/t/${user.schoolId}/reset-password?token=${resetToken}`
      : `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await EmailService.sendPasswordReset({
        to: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        schoolName: user.school?.name || 'EDucore',
        resetLink: resetUrl,
        schoolId: user.schoolId || undefined
      });

      console.log(`📧 Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error - we don't want to reveal if email failed
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword, passwordConfirm } = req.body;

    if (!token || !newPassword || !passwordConfirm) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if passwords match
    if (!passwordsMatch(newPassword, passwordConfirm)) {
      throw new ApiError(400, 'Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword, DEFAULT_PASSWORD_POLICY);
    if (!passwordValidation.valid) {
      throw new ApiError(400, passwordValidation.errors.join(', '));
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        loginAttempts: 0, // Reset failed attempts
        lockedUntil: null, // Unlock account if locked
      }
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password'
    });
  }

  async logout(req: AuthRequest, res: Response) {
    // In a stateless JWT system, logout is primarily client-side
    // But we can log the event for audit purposes
    const userId = req.user!.userId;

    console.log(`👋 User ${userId} logged out at ${new Date().toISOString()}`);

    // Optional: Implement token blacklist here if needed
    // await redisClient.set(`blacklist:${token}`, '1', 'EX', 900); // 15 min

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  async me(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        schoolId: true,
        branchId: true,
        school: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: user
    });
  }

  async sendWhatsAppVerification(req: Request, res: Response) {
    const { phone, code } = req.body;

    if (!phone) {
      throw new ApiError(400, 'Phone number is required');
    }

    // For development: Auto-approve with code 123456
    const verificationCode = code || '123456';

    try {
      // TODO: Integrate with WhatsApp Business API or service like Twilio
      // For now, we'll just simulate sending

      // Example with Twilio (uncomment when ready):
      // const accountSid = process.env.TWILIO_ACCOUNT_SID;
      // const authToken = process.env.TWILIO_AUTH_TOKEN;
      // const client = require('twilio')(accountSid, authToken);
      // 
      // await client.messages.create({
      //   from: 'whatsapp:+14155238886', // Twilio WhatsApp number
      //   body: `Your verification code is: ${verificationCode}`,
      //   to: `whatsapp:${phone}`
      // });

      console.log(`📱 WhatsApp verification code for ${phone}: ${verificationCode}`);

      res.json({
        success: true,
        message: 'Verification code sent via WhatsApp',
        // In development, return the code for testing
        code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      });
    } catch (error) {
      console.error('WhatsApp verification error:', error);
      throw new ApiError(500, 'Failed to send WhatsApp verification');
    }
  }

  async getSeededUsers(_req: Request, res: Response) {
    // Only available in development
    if (process.env.NODE_ENV !== 'development') {
      throw new ApiError(403, 'This endpoint is only available in development');
    }

    try {
      // Fetch users created by seed (typically have specific roles or emails)
      const seededUsers = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { email: { contains: '@local.test' } }
          ]
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          schoolId: true,
          branchId: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Map passwords based on role (matching seed file)
      const passwordMap: Record<string, string> = {
        'superadmin@local.test': process.env.SUPER_ADMIN_PASSWORD ?? 'ChangeMeNow123!', // SUPER_ADMIN
        'admin@local.test': 'Admin123!',  // ADMIN
        'headteacher@local.test': 'HeadTeacher123!',
        'teacher@local.test': 'Teacher123!',
        'parent@local.test': 'Parent123!',
        'accountant@local.test': 'Accountant123!',
        'receptionist@local.test': 'Receptionist123!'
      };

      // Return with correct password hints
      const usersWithHints = seededUsers.map(user => ({
        ...user,
        passwordHint: passwordMap[user.email] || 'Check seed file'
      }));

      res.json({
        success: true,
        users: usersWithHints,
        note: 'These are seeded development users. Use the password shown for each user.'
      });
    } catch (error) {
      console.error('Error fetching seeded users:', error);
      throw new ApiError(500, 'Failed to fetch seeded users');
    }
  }

  async checkAvailability(req: Request, res: Response) {
    const { email, phone } = req.body;

    if (!email && !phone) {
      throw new ApiError(400, 'Email or phone is required');
    }

    const conflicts: string[] = [];

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) conflicts.push('Email already exists');
    }

    if (phone) {
      // Basic normalization of phone if needed, but assuming exact match for now
      // Should ideally match the normalization in register
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) conflicts.push('Phone number already exists');
    }

    if (conflicts.length > 0) {
      res.status(409).json({
        success: false,
        message: conflicts[0], // Return the first conflict message
        conflicts // return all for detailed handling if needed
      });
      return;
    }

    res.json({
      success: true,
      message: 'Available'
    });
  }
}
