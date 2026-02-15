import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { EmailService } from './email-resend.service';

export interface SchoolProvisioningData {
  // School details
  schoolName: string;
  admissionFormatType: 'NO_BRANCH' | 'BRANCH_PREFIX_START' | 'BRANCH_PREFIX_MIDDLE' | 'BRANCH_PREFIX_END';
  branchSeparator?: string;

  // Admin user details
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone?: string;

  // Subscription details
  planId?: string;
  trialDays?: number;

  // Optional school details
  registrationNo?: string;
  address?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  motto?: string;
  vision?: string;
  mission?: string;
}

export interface ProvisioningResult {
  school: any;
  adminUser: any;
  subscription: any;
  defaultBranch?: any;
  admissionSequence: any;
  tempPassword: string;
  loginUrl: string;
}

/**
 * Complete school provisioning workflow
 * Creates: School → Admin User → Subscription → Default Branch → Admission Sequence
 */
export async function provisionNewSchool(
  data: SchoolProvisioningData
): Promise<ProvisioningResult> {

  // Generate temporary password (12 characters, alphanumeric + special chars)
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Get default trial plan if not specified
  const planId = data.planId || await getDefaultTrialPlanId();

  // Execute in transaction to ensure all-or-nothing
  const result = await prisma.$transaction(async (tx) => {

    // 1. Create School
    console.log('📚 Creating school:', data.schoolName);
    const school = await tx.school.create({
      data: {
        name: data.schoolName,
        admissionFormatType: data.admissionFormatType,
        branchSeparator: data.branchSeparator || '-',
        registrationNo: data.registrationNo,
        address: data.address,
        county: data.county,
        subCounty: data.subCounty,
        ward: data.ward,
        phone: data.phone,
        email: data.email || data.adminEmail,
        website: data.website,
        principalName: data.principalName,
        principalPhone: data.principalPhone,
        motto: data.motto,
        vision: data.vision,
        mission: data.mission,
        active: true,
        status: 'TRIAL',
        trialStart: new Date(),
        trialDays: data.trialDays || 30,
        curriculumType: 'CBC_AND_EXAM',
        assessmentMode: 'MIXED'
      }
    });

    // 2. Create Admin User
    console.log('👤 Creating admin user:', data.adminEmail);
    const adminUser = await tx.user.create({
      data: {
        email: data.adminEmail,
        username: data.adminEmail.split('@')[0],
        password: hashedPassword,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        phone: data.adminPhone,
        role: 'ADMIN',
        status: 'ACTIVE',
        schoolId: school.id,
        branchId: null, // Admin has access to all branches
        emailVerified: false
      }
    });

    // 3. Create Trial Subscription
    console.log('💳 Creating subscription with plan:', planId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.trialDays || 30));

    const subscription = await tx.schoolSubscription.create({
      data: {
        schoolId: school.id,
        planId: planId,
        startedAt: new Date(),
        expiresAt: expiresAt,
        status: 'ACTIVE'
      }
    });

    // 4. Create Default Branch (if multi-branch format)
    let defaultBranch = null;
    if (data.admissionFormatType !== 'NO_BRANCH') {
      console.log('🏢 Creating default branch');
      defaultBranch = await tx.branch.create({
        data: {
          schoolId: school.id,
          name: 'Main Campus',
          code: 'MC',
          address: data.address,
          phone: data.phone,
          email: data.email,
          principalName: data.principalName,
          active: true
        }
      });
    }

    // 5. Create Admission Sequence for current year
    const currentYear = new Date().getFullYear();
    console.log('🔢 Creating admission sequence for year:', currentYear);
    const admissionSequence = await tx.admissionSequence.create({
      data: {
        schoolId: school.id,
        academicYear: currentYear,
        currentValue: 0
      }
    });

    // 6. Create Default Communication Config
    await tx.communicationConfig.create({
      data: {
        schoolId: school.id,
        smsProvider: 'mobilesasa',
        smsEnabled: true,
        smsSenderId: 'MOBILESASA',
        emailProvider: 'resend',
        emailEnabled: false,
        mpesaProvider: 'intasend',
        mpesaEnabled: false,
        birthdayEnabled: false
      }
    });

    // 7. Create Term Configs for current and next academic year
    console.log('📅 Creating term configurations');
    const termDates = [
      { term: 'TERM_1', start: new Date(currentYear, 0, 15), end: new Date(currentYear, 3, 15) }, // Jan-Apr
      { term: 'TERM_2', start: new Date(currentYear, 4, 15), end: new Date(currentYear, 7, 15) }, // May-Aug
      { term: 'TERM_3', start: new Date(currentYear, 8, 15), end: new Date(currentYear, 11, 15) } // Sep-Dec
    ];

    for (const { term, start, end } of termDates) {
      await tx.termConfig.create({
        data: {
          schoolId: school.id,
          academicYear: currentYear,
          term: term as any,
          startDate: start,
          endDate: end,
          formativeWeight: 30.0,
          summativeWeight: 70.0,
          isActive: term === 'TERM_1', // Only first term is active initially
          isClosed: false,
          createdBy: adminUser.id
        }
      });
    }

    // 8. Create Aggregation Configs for each Formative Assessment Type
    console.log('📊 Creating aggregation configurations');
    const aggregationStrategies = [
      { type: 'OPENER', strategy: 'DROP_LOWEST_N' as const, nValue: 1 },
      { type: 'WEEKLY', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'MONTHLY', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'CAT', strategy: 'BEST_N' as const, nValue: 3 },
      { type: 'MID_TERM', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'ASSIGNMENT', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'PROJECT', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'PRACTICAL', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'QUIZ', strategy: 'DROP_LOWEST_N' as const, nValue: 1 },
      { type: 'OBSERVATION', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'ORAL', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'EXAM', strategy: 'SIMPLE_AVERAGE' as const, nValue: null },
      { type: 'OTHER', strategy: 'SIMPLE_AVERAGE' as const, nValue: null }
    ];

    for (const { type, strategy, nValue } of aggregationStrategies) {
      await tx.aggregationConfig.create({
        data: {
          schoolId: school.id,
          type: type as any,
          strategy: strategy,
          nValue: nValue,
          weight: 1.0,
          createdBy: adminUser.id
        }
      });
    }

    // 9. Create Default Fee Types
    console.log('💰 Creating default fee types');
    const defaultFeeTypes = [
      { code: 'TUITION', name: 'Tuition', category: 'ACADEMIC', description: 'School tuition fees' },
      { code: 'ACTIVITY', name: 'Activity Fee', category: 'EXTRA_CURRICULAR', description: 'Co-curricular activities' },
      { code: 'TRANSPORT', name: 'Transport', category: 'TRANSPORT', description: 'School transport' },
      { code: 'MEALS', name: 'Meals', category: 'BOARDING', description: 'School meals and catering' },
      { code: 'EXAM', name: 'Examination Fee', category: 'ACADEMIC', description: 'Examination fees' },
      { code: 'LIBRARY', name: 'Library', category: 'ACADEMIC', description: 'Library resources and materials' },
      { code: 'SPORTS', name: 'Sports Fee', category: 'EXTRA_CURRICULAR', description: 'Sports programs and facilities' },
      { code: 'TECHNOLOGY', name: 'Technology Fee', category: 'ACADEMIC', description: 'Computer lab and tech resources' },
      { code: 'MISC', name: 'Miscellaneous', category: 'OTHER', description: 'Other school charges' }
    ];

    for (const feeType of defaultFeeTypes) {
      await tx.feeType.create({
        data: {
          schoolId: school.id,
          code: feeType.code,
          name: feeType.name,
          category: feeType.category as any,
          description: feeType.description,
          isActive: true
        }
      });
    }

    return { school, adminUser, subscription, defaultBranch, admissionSequence };
  });

  // 6. Send welcome email to admin (outside transaction)
  try {
    await EmailService.sendWelcomeEmail({
      to: data.adminEmail,
      schoolName: data.schoolName,
      adminName: `${data.adminFirstName} ${data.adminLastName}`,
      tempPassword: tempPassword,
      loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
  } catch (error) {
    console.error('⚠️ Failed to send welcome email:', error);
    // Don't fail the whole operation if email fails
  }

  console.log('✅ School provisioning complete!');

  return {
    ...result,
    tempPassword,
    loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  };
}

/**
 * Generate a secure temporary password
 */
function generateTempPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%';

  let password = '';

  // Ensure at least one of each type
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest randomly
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get default trial plan ID
 */
async function getDefaultTrialPlanId(): Promise<string> {
  let plan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'Trial Plan', isActive: true }
  });

  // Create default trial plan if it doesn't exist
  if (!plan) {
    console.log('📋 Creating default trial plan');
    plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Trial Plan',
        modules: {
          ASSESSMENT: true,
          LEARNERS: true,
          ATTENDANCE: true,
          FEES: true,
          REPORTS: true,
          SETTINGS: true,
          TUTORS: false,
          PARENTS: false,
          SECURITY: false,
          LIBRARY: false,
          TRANSPORT: false,
          HEALTH: false
        },
        maxBranches: 1,
        isActive: true
      }
    });
  }

  return plan.id;
}


