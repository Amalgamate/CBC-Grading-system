import { SmsService } from './sms.service';
import prisma from '../config/database';
import crypto from 'crypto';
import fs from 'fs';

interface OtpResult {
    success: boolean;
    message: string;
    expiresAt?: Date;
}

interface OtpVerifyResult {
    success: boolean;
    message: string;
    user?: any;
}

export class OtpService {
    // OTP Configuration
    private static readonly OTP_LENGTH = 6;
    private static readonly OTP_EXPIRY_MINUTES = 5;
    private static readonly MAX_ATTEMPTS = 3;

    /**
     * Generate a 6-digit OTP code
     */
    private static generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Send OTP to user's phone
     */
    static async sendOTP(email: string, schoolId?: string): Promise<OtpResult> {
        try {
            const logMsg = `[${new Date().toISOString()}] OTP Request for: ${email}, schoolId: ${schoolId || 'not provided'}\n`;
            fs.appendFileSync('otp-debug.log', logMsg);

            console.log(`📱 OTP Request for: ${email}, schoolId: ${schoolId || 'not provided'}`);

            // 1. Find user by email
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    status: true,
                    schoolId: true
                }
            });

            if (!user) {
                const err = `❌ OTP Error: User not found for email: ${email}`;
                console.error(err);
                fs.appendFileSync('otp-debug.log', err + '\n');
                return {
                    success: false,
                    message: 'User not found with this email address'
                };
            }

            if (user.status !== 'ACTIVE') {
                const err = `❌ OTP Error: Account not active for: ${email}, status: ${user.status}`;
                console.error(err);
                fs.appendFileSync('otp-debug.log', err + '\n');
                return {
                    success: false,
                    message: 'Account is not active. Please contact your administrator.'
                };
            }

            if (!user.phone) {
                const err = `❌ OTP Error: No phone number for user: ${email}`;
                console.error(err);
                fs.appendFileSync('otp-debug.log', err + '\n');
                return {
                    success: false,
                    message: 'No phone number registered. Please contact your administrator.'
                };
            }

            // Ensure we have a schoolId for SMS configuration
            let effectiveSchoolId: string = user.schoolId || schoolId || '';

            if (!effectiveSchoolId) {
                // If it's a SUPER_ADMIN or other system user, fallback to the first available school
                // so we can at least attempt to use its SMS configuration.
                const firstSchool = await prisma.school.findFirst({ select: { id: true } });
                if (firstSchool) {
                    effectiveSchoolId = firstSchool.id;
                    const warnMsg = `⚠️ No schoolId for ${email}, falling back to school: ${effectiveSchoolId}\n`;
                    fs.appendFileSync('otp-debug.log', warnMsg);
                }
            }

            if (!effectiveSchoolId) {
                const err = `❌ OTP Error: No schoolId available for user: ${email} and no fallback school found.`;
                console.error(err);
                fs.appendFileSync('otp-debug.log', err + '\n');
                return {
                    success: false,
                    message: 'School configuration not found. Please contact your administrator.'
                };
            }

            // 2. Generate OTP
            const otpCode = this.generateOTP();
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

            // Log OTP for development/testing
            fs.appendFileSync('otp-debug.log', `[${new Date().toISOString()}] GENERATED OTP FOR ${email}: ${otpCode}\n`);
            console.log(`🔑 Generated OTP for ${email}: ${otpCode}`);

            // 3. Store OTP in database
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    phoneVerificationCode: otpCode,
                    phoneVerificationSentAt: new Date()
                }
            });

            // 4. Send SMS via MobileSasa
            const message = `Your EDucore login OTP is: ${otpCode}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;

            const smsResult = await SmsService.sendSms(
                effectiveSchoolId,
                user.phone,
                message
            );

            if (!smsResult.success) {
                const warnMsg = `⚠️ SMS Sending failed: ${smsResult.error}. Logic will proceed because process.env.NODE_ENV is development.\n`;
                console.warn(warnMsg);
                fs.appendFileSync('otp-debug.log', warnMsg);

                // In development, we allow the flow to continue so the user is not blocked
                // as long as we have logged the OTP for them to see.
                if (process.env.NODE_ENV === 'development') {
                    return {
                        success: true,
                        message: `[DEV MODE] OTP generated (SMS failed but bypassed). Check server logs/otp-debug.log`,
                        expiresAt
                    };
                }

                return {
                    success: false,
                    message: `Failed to send OTP: ${smsResult.error}`
                };
            }

            return {
                success: true,
                message: `OTP sent to ${this.maskPhoneNumber(user.phone)}`,
                expiresAt
            };

        } catch (error: any) {
            console.error('OTP Send Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP'
            };
        }
    }

    /**
     * Verify OTP and return user data
     */
    static async verifyOTP(email: string, otp: string): Promise<OtpVerifyResult> {
        try {
            // 1. Find user
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    school: true,
                    branch: true
                }
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // 2. Check if OTP exists
            if (!user.phoneVerificationCode || !user.phoneVerificationSentAt) {
                return {
                    success: false,
                    message: 'No OTP sent. Please request a new one.'
                };
            }

            // 3. Check if OTP has expired
            const sentAt = new Date(user.phoneVerificationSentAt);
            const expiryTime = new Date(sentAt.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

            if (new Date() > expiryTime) {
                // Clear expired OTP
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        phoneVerificationCode: null,
                        phoneVerificationSentAt: null
                    }
                });

                return {
                    success: false,
                    message: 'OTP has expired. Please request a new one.'
                };
            }

            // 4. Verify OTP
            if (user.phoneVerificationCode !== otp) {
                return {
                    success: false,
                    message: 'Invalid OTP code'
                };
            }

            // 5. Clear OTP after successful verification
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    phoneVerificationCode: null,
                    phoneVerificationSentAt: null,
                    emailVerified: true // Mark as verified
                }
            });

            // 6. Return user data (similar to login)
            return {
                success: true,
                message: 'OTP verified successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    schoolId: user.schoolId,
                    branchId: user.branchId,
                    school: user.school,
                    branch: user.branch,
                    phone: user.phone
                }
            };

        } catch (error: any) {
            console.error('OTP Verify Error:', error);
            return {
                success: false,
                message: error.message || 'Failed to verify OTP'
            };
        }
    }

    /**
     * Mask phone number for privacy (254712345678 → 254****5678)
     */
    private static maskPhoneNumber(phone: string): string {
        if (!phone || phone.length < 8) return phone;
        const start = phone.substring(0, 3);
        const end = phone.substring(phone.length - 4);
        return `${start}****${end}`;
    }

    /**
     * Check if user can request OTP (rate limiting)
     */
    static async canRequestOTP(email: string): Promise<{ allowed: boolean; waitSeconds?: number }> {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                select: { phoneVerificationSentAt: true }
            });

            if (!user || !user.phoneVerificationSentAt) {
                return { allowed: true };
            }

            // Allow new OTP after 60 seconds
            const COOLDOWN_SECONDS = 60;
            const timeSinceLastOTP = (Date.now() - new Date(user.phoneVerificationSentAt).getTime()) / 1000;

            if (timeSinceLastOTP < COOLDOWN_SECONDS) {
                return {
                    allowed: false,
                    waitSeconds: Math.ceil(COOLDOWN_SECONDS - timeSinceLastOTP)
                };
            }

            return { allowed: true };

        } catch (error) {
            return { allowed: true }; // Allow on error to avoid blocking users
        }
    }
}
