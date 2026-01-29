import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { ApiError } from '../utils/error.util';
import { Role, canManageRole } from '../config/permissions';
import { AuthRequest } from '../middleware/permissions.middleware';

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

    // Validate password strength
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is not active');
    }

    // Tenant-first enforcement (Phase B):
    // If login is initiated from a tenant-specific portal, ensure the user belongs to that tenant.
    // SUPER_ADMIN is exempt (they can operate across schools).
    if (tenantSchoolId && user.role !== 'SUPER_ADMIN') {
      if (!user.schoolId) {
        throw new ApiError(403, 'No school association found. Please contact support.');
      }
      if (user.schoolId !== tenantSchoolId) {
        throw new ApiError(403, 'Wrong school portal for this account. Please use your school login link.');
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
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
}
