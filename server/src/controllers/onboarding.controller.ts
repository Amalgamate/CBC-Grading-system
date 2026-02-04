import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { gradingService } from '../services/grading.service';
import { EmailService } from '../services/email-resend.service';
import { SmsService } from '../services/sms.service';

export class OnboardingController {
  async registerSchool(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, error: 'School name is required' });
      }

      // Use transaction to ensure all data is created atomically
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create School
        const school = await tx.school.create({
          data: {
            name: name.trim(),
            active: true,
            status: 'TRIAL',
            trialStart: new Date(),
            trialDays: 30,
            admissionFormatType: 'BRANCH_PREFIX_START',
            branchSeparator: '-',
          },
        });

        // 2. Create Default Branch
        const branch = await tx.branch.create({
          data: {
            schoolId: school.id,
            name: 'Main Campus',
            code: 'MC',
            address: school.address || '',
            phone: school.phone || '',
            email: school.email || '',
            active: true,
          },
        });

        // 3. Create Admission Sequence
        await tx.admissionSequence.create({
          data: {
            schoolId: school.id,
            academicYear: new Date().getFullYear(),
            currentValue: 0,
          },
        });

        // 4. Create Default Streams (A, B, C, D)
        const streamNames = ['A', 'B', 'C', 'D'];
        for (const streamName of streamNames) {
          await tx.streamConfig.create({
            data: {
              schoolId: school.id,
              name: streamName,
              active: true,
            },
          });
        }

        return { school, branch };
      });

      // 5. Initialize Grading Systems (outside transaction for safety)
      try {
        await gradingService.getGradingSystem(result.school.id, 'SUMMATIVE');
        await gradingService.getGradingSystem(result.school.id, 'CBC');
      } catch (error) {
        console.warn('Warning: Failed to initialize grading systems:', error);
      }

      console.log(`✅ School provisioned: ${result.school.name} (ID: ${result.school.id})`);
      console.log(`   - Branch: ${result.branch.name} (${result.branch.code})`);
      console.log(`   - Streams: A, B, C, D created`);
      console.log(`   - Grading systems initialized`);

      res.status(201).json({ success: true, data: result.school });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'A school with this name already exists' });
      }
      console.error('Onboarding registerSchool error:', error);
      res.status(500).json({ success: false, error: error?.message || 'Failed to register school' });
    }
  }

  async registerFull(req: Request, res: Response) {
    try {
      const {
        fullName,
        email,
        phone,
        address,
        county,
        subCounty,
        ward,
        schoolName,
        schoolType,
        password,
        passwordConfirm
      } = req.body;

      if (!fullName || fullName.length < 2 || fullName.length > 100) {
        return res.status(400).json({ success: false, error: 'Invalid full name' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email' });
      }
      // Relaxed phone regex: supports + prefixed international or local 07/01/02
      // Supports: +254..., 07..., 01..., 02...
      const phoneRegex = /^(\+?[1-9]\d{1,14}|0[1-9]\d{8})$/;
      if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return res.status(400).json({ success: false, error: 'Invalid phone format (e.g., 0712345678 or +254712345678)' });
      }
      if (!address || !county || !schoolName || !password || !passwordConfirm) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      if (password !== passwordConfirm) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
      }
      // Password strength: Match frontend (8+ chars) but keeping some complexity
      const strong =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);

      if (!strong) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email or phone already exists' });
      }

      // Use transaction to ensure all data is created atomically
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create School
        const school = await tx.school.create({
          data: {
            name: schoolName.trim(),
            address,
            county,
            subCounty: subCounty || null,
            ward: ward || null,
            phone,
            email,
            active: true,
            status: 'TRIAL',
            trialStart: new Date(),
            trialDays: 30,
            schoolType: schoolType || null,
            admissionFormatType: 'BRANCH_PREFIX_START',
            branchSeparator: '-',
          }
        });

        // 2. Create Default Branch
        const branch = await tx.branch.create({
          data: {
            schoolId: school.id,
            name: 'Main Campus',
            code: 'MC',
            address: address || '',
            phone: phone || '',
            email: email || '',
            active: true,
          },
        });

        // 3. Create Admission Sequence
        await tx.admissionSequence.create({
          data: {
            schoolId: school.id,
            academicYear: new Date().getFullYear(),
            currentValue: 0,
          },
        });

        // 4. Create Default Streams (A, B, C, D)
        const streamNames = ['A', 'B', 'C', 'D'];
        for (const streamName of streamNames) {
          await tx.streamConfig.create({
            data: {
              schoolId: school.id,
              name: streamName,
              active: true,
            },
          });
        }

        // 5. Create Admin User
        const [firstName, ...rest] = fullName.trim().split(' ');
        const lastName = rest.join(' ') || ' ';
        const hashed = await bcrypt.hash(password, 12);
        const token = randomUUID();
        const code = String(Math.floor(100000 + Math.random() * 900000));

        const user = await tx.user.create({
          data: {
            email,
            password: hashed,
            firstName,
            lastName,
            role: 'ADMIN',
            phone,
            emailVerified: false,
            schoolId: school.id,
            branchId: branch.id, // Assign to default branch
            emailVerificationToken: token,
            emailVerificationSentAt: new Date(),
            phoneVerificationCode: code,
            phoneVerificationSentAt: new Date()
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

        return { school, branch, user, token, code };
      });

      // 6. Initialize Grading Systems (outside transaction for safety)
      try {
        await gradingService.getGradingSystem(result.school.id, 'SUMMATIVE');
        await gradingService.getGradingSystem(result.school.id, 'CBC');
      } catch (error) {
        console.warn('Warning: Failed to initialize grading systems:', error);
      }

      console.log(`✅ School & Admin provisioned: ${result.school.name}`);
      console.log(`   - School ID: ${result.school.id}`);
      console.log(`   - Branch: ${result.branch.name} (${result.branch.code})`);
      console.log(`   - Admin: ${result.user.email}`);
      console.log(`   - Streams: A, B, C, D created`);
      console.log(`   - Grading systems initialized`);

      // 7. Trigger Welcome Notifications (ENABLED!)
      const frontendUrl = process.env.FRONTEND_URL || 'https://educorev1.up.railway.app';
      const loginUrl = `${frontendUrl}/t/${result.school.id}/login`;

      // Send Onboarding Email (async - don't block response)
      EmailService.sendOnboardingEmail({
        to: result.user.email,
        schoolName: result.school.name,
        adminName: `${result.user.firstName} ${result.user.lastName}`,
        loginUrl,
        schoolId: result.school.id
      }).catch(err => {
        console.error('❌ Failed to send onboarding email:', err);
      });

      // Send Welcome SMS (async - don't block response)
      if (result.user.phone) {
        SmsService.sendWelcomeSms(
          result.school.id,
          result.user.phone,
          result.school.name
        ).catch(err => {
          console.error('❌ Failed to send welcome SMS:', err);
        });
      }

      const { school, user, token, code } = result;

      res.status(201).json({
        success: true,
        data: { school, user },
        meta: {
          emailVerificationToken: process.env.NODE_ENV === 'development' ? token : undefined,
          phoneCode: process.env.NODE_ENV === 'development' ? code : undefined
        }
      });
    } catch (error: any) {
      console.error('Onboarding registerFull error:', error);
      res.status(500).json({ success: false, error: 'Failed to register' });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query as any;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Missing token' });
      }
      const user = await prisma.user.findFirst({
        where: { emailVerificationToken: String(token) }
      });
      if (!user) {
        return res.status(404).json({ success: false, error: 'Invalid token' });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, status: 'ACTIVE', emailVerificationToken: null }
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  }

  async verifyPhone(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Missing email or code' });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.phoneVerificationCode !== code) {
        return res.status(400).json({ success: false, error: 'Invalid code' });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerificationCode: null }
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: 'Phone verification failed' });
    }
  }

  async getBranchOptionsByEmail(req: Request, res: Response) {
    try {
      const email = String((req.query as any).email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.schoolId) {
        return res.json({ success: true, branches: [] });
      }
      const branches = await prisma.branch.findMany({
        where: { schoolId: user.schoolId },
        select: { id: true, name: true, code: true }
      });
      res.json({ success: true, branches });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch branch options' });
    }
  }
}
