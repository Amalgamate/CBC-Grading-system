import { Request, Response } from 'express';
import prisma from '../config/database';
import { encrypt } from '../utils/encryption.util';
import { SmsService } from '../services/sms.service';
import { EmailService } from '../services/email-resend.service';
import { AuthRequest } from '../middleware/permissions.middleware';

/**
 * Get Communication Configuration for a School
 * GET /api/communication/config/:schoolId
 */
export const getCommunicationConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId } = req.params;

        // Tenant check
        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized access to school configuration' });
        }

        const config = await prisma.communicationConfig.findUnique({
            where: { schoolId }
        });

        if (!config) {
            // Return defaults if not found
            return res.status(200).json({
                data: {
                    schoolId,
                    sms: {
                        enabled: false,
                        provider: 'mobilesasa',
                        hasApiKey: false,
                        senderId: ''
                    },
                    email: {
                        enabled: false,
                        provider: 'resend',
                        hasApiKey: false
                    },
                    mpesa: {
                        enabled: false,
                        provider: 'intasend',
                        hasSecretKey: false
                    },
                    birthdays: {
                        enabled: false,
                        template: "Happy Birthday {learnerName}! Best wishes from {schoolName}."
                    }
                }
            });
        }

        // Return config with masked keys
        res.status(200).json({
            data: {
                id: config.id,
                schoolId: config.schoolId,
                sms: {
                    enabled: config.smsEnabled,
                    provider: config.smsProvider,
                    baseUrl: config.smsBaseUrl,
                    senderId: config.smsSenderId,
                    hasApiKey: !!config.smsApiKey, // Boolean flag
                    // custom provider fields
                    customName: config.smsCustomName,
                    customUrl: config.smsCustomBaseUrl,
                    customAuthHeader: config.smsCustomAuthHeader,
                    hasCustomToken: !!config.smsCustomToken
                },
                email: {
                    enabled: config.emailEnabled,
                    provider: config.emailProvider,
                    fromEmail: config.emailFrom,
                    fromName: config.emailFromName,
                    hasApiKey: !!config.emailApiKey,
                    emailTemplates: config.emailTemplates
                },
                mpesa: {
                    enabled: config.mpesaEnabled,
                    provider: config.mpesaProvider,
                    publicKey: config.mpesaPublicKey,
                    businessNumber: config.mpesaBusinessNo,
                    hasSecretKey: !!config.mpesaSecretKey
                },
                birthdays: {
                    enabled: config.birthdayEnabled,
                    template: config.birthdayMessageTemplate || "Happy Birthday {learnerName}! Best wishes from {schoolName}."
                },
                createdAt: config.createdAt,
                updatedAt: config.updatedAt
            }
        });

    } catch (error: any) {
        console.error('Get Communication Config Error:', error);
        res.status(500).json({ error: error.message || 'Failed to get configuration' });
    }
};

/**
 * Save Communication Configuration
 * POST /api/communication/config
 */
export const saveCommunicationConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId, sms, email, mpesa, birthdays } = req.body;

        if (!schoolId) {
            return res.status(400).json({ error: 'schoolId is required' });
        }

        // Tenant check
        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized access to school configuration' });
        }

        // Prepare data for upsert
        const data: any = {
            schoolId
        };

        // SMS Configuration
        if (sms) {
            data.smsProvider = sms.provider || 'mobilesasa';
            data.smsBaseUrl = sms.baseUrl || 'https://api.mobilesasa.com';
            data.smsSenderId = sms.senderId || null;
            data.smsEnabled = sms.enabled !== undefined ? sms.enabled : false;

            // Encrypt API key if provided
            if (sms.apiKey) {
                data.smsApiKey = encrypt(sms.apiKey);
            }

            // Custom provider fields
            if (sms.provider === 'custom') {
                data.smsCustomName = sms.customName || null;
                data.smsCustomBaseUrl = sms.customBaseUrl || null;
                data.smsCustomAuthHeader = sms.customAuthHeader || 'Authorization';
                if (sms.customToken) {
                    data.smsCustomToken = encrypt(sms.customToken);
                }
            }
        }

        // Email Configuration
        if (email) {
            data.emailProvider = email.provider || 'resend';
            data.emailFrom = email.fromEmail || null;
            data.emailFromName = email.fromName || null;
            data.emailEnabled = email.enabled !== undefined ? email.enabled : false;

            if (email.apiKey) {
                data.emailApiKey = encrypt(email.apiKey);
            }

            // Save templates if provided
            if (email.emailTemplates) {
                data.emailTemplates = email.emailTemplates;
            }
        }

        // M-Pesa Configuration
        if (mpesa) {
            data.mpesaProvider = mpesa.provider || 'intasend';
            data.mpesaPublicKey = mpesa.publicKey || null;
            data.mpesaBusinessNo = mpesa.businessNumber || null;
            data.mpesaEnabled = mpesa.enabled !== undefined ? mpesa.enabled : false;

            if (mpesa.secretKey) {
                data.mpesaSecretKey = encrypt(mpesa.secretKey);
            }
        }

        // Birthday Configuration
        if (birthdays) {
            data.birthdayEnabled = birthdays.enabled !== undefined ? birthdays.enabled : false;
            data.birthdayMessageTemplate = birthdays.template || null;
        }

        // Upsert configuration
        const config = await prisma.communicationConfig.upsert({
            where: { schoolId },
            create: data,
            update: data
        });

        res.status(200).json({
            message: 'Configuration saved successfully',
            data: {
                id: config.id,
                schoolId: config.schoolId,
                updatedAt: config.updatedAt
            }
        });

    } catch (error: any) {
        console.error('Save Communication Config Error:', error);
        res.status(500).json({ error: error.message || 'Failed to save configuration' });
    }
};

/**
 * Send Test SMS
 * POST /api/communication/test/sms
 */
export const sendTestSms = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId, phoneNumber, message } = req.body;

        if (!schoolId || !phoneNumber || !message) {
            return res.status(400).json({
                error: 'schoolId, phoneNumber, and message are required'
            });
        }

        // Tenant check
        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized access to school configuration' });
        }

        // Send SMS
        const result = await SmsService.sendSms(schoolId, phoneNumber, message);

        if (!result.success) {
            return res.status(400).json({
                error: result.error || 'Failed to send SMS'
            });
        }

        res.status(200).json({
            message: 'SMS sent successfully',
            messageId: result.messageId,
            provider: result.provider
        });

    } catch (error: any) {
        console.error('Send Test SMS Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send test SMS' });
    }
};

/**
 * Send Test Email
 * POST /api/communication/test/email
 */
export const sendTestEmail = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId, email, template = 'welcome' } = req.body;

        if (!schoolId || !email) {
            return res.status(400).json({
                error: 'schoolId and email are required'
            });
        }

        // Tenant check
        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized access to school configuration' });
        }

        // Fetch School Name for context
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true }
        });
        const schoolName = school?.name || 'Your School';
        const adminName = req.user?.userId ? (await prisma.user.findUnique({ where: { id: req.user.userId } }))?.firstName || 'Admin' : 'Admin';

        const frontendUrl = process.env.FRONTEND_URL || 'https://educorev1.up.railway.app';
        const loginUrl = `${frontendUrl}/t/${schoolId}/login`;

        // Send Email based on template selection
        if (template === 'onboarding') {
            await EmailService.sendOnboardingEmail({
                to: email,
                schoolName,
                adminName,
                loginUrl,
                schoolId
            });
        } else {
            // Default to Welcome
            await EmailService.sendWelcomeEmail({
                to: email,
                schoolName,
                adminName,
                loginUrl,
                schoolId
            });
        }

        res.status(200).json({
            message: `Test email (${template}) sent successfully to ${email}`,
            provider: 'resend' // We know it's resend
        });

    } catch (error: any) {
        console.error('Send Test Email Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send test email' });
    }
};

/**
 * Get Learners with Birthdays Today
 * GET /api/communication/birthdays/today/:schoolId
 */
export const getBirthdaysToday = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId } = req.params;

        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get current date MM-DD
        const now = new Date();
        const monthDay = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        // Fetch all learners for the school
        // Note: Prisma doesn't have a direct "month-day" comparison for DateTime easily without raw query
        // so we fetch and filter or use a raw query. For reliability across diff DBs, filtering is safer if count is manageable.
        const learners = await prisma.learner.findMany({
            where: { schoolId, status: 'ACTIVE' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                guardianPhone: true,
                emergencyPhone: true,
                grade: true,
                stream: true,
                admissionNumber: true
            }
        });

        const birthdaysToday = learners.filter(l => {
            if (!l.dateOfBirth) return false;
            const dob = new Date(l.dateOfBirth);
            const dobMonthDay = `${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob.getDate().toString().padStart(2, '0')}`;
            return dobMonthDay === monthDay;
        }).map(l => ({
            ...l,
            name: `${l.firstName} ${l.lastName}`,
            guardianPhone: l.guardianPhone || l.emergencyPhone
        }));

        res.status(200).json({ data: birthdaysToday });

    } catch (error: any) {
        console.error('Get Birthdays Today Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch birthdays' });
    }
};

/**
 * Send Birthday Wishes
 * POST /api/communication/birthdays/send
 */
export const sendBirthdayWishes = async (req: AuthRequest, res: Response) => {
    try {
        const { schoolId, learnerIds, template, channel = 'sms' } = req.body;

        if (!schoolId || !learnerIds || !Array.isArray(learnerIds)) {
            return res.status(400).json({ error: 'schoolId and learnerIds array are required' });
        }

        if (req.user?.schoolId && req.user.schoolId !== schoolId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Fetch school name for template
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true }
        });

        const schoolName = school?.name || 'Your School';

        // Fetch learners
        const learners = await prisma.learner.findMany({
            where: {
                id: { in: learnerIds },
                schoolId
            }
        });

        const results = [];
        const msgTemplate = template || "*Happy Birthday {firstName}!* 🎂🎈\n\n{schoolName} is thrilled to celebrate you on your *{ageOrdinal} birthday* today, {birthdayDate}! 🎊 \n\nWe are so proud of your progress in *${gradeName}*. May your day be filled with joy, laughter, and wonderful memories. Keep shining bright! ✨\n\nBest wishes,\n*The {schoolName} Family*";

        const calculateAge = (dob: Date) => {
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            return age;
        };

        for (const learner of learners) {
            const phoneNumber = learner.guardianPhone || learner.emergencyPhone;
            if (!phoneNumber) {
                results.push({ learnerId: learner.id, success: false, error: 'No phone number' });
                continue;
            }

            const formatTitleCase = (str: string) => {
                if (!str) return '';
                return str.toLowerCase().split(/[_\s]+/).map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            };

            const getOrdinal = (n: number) => {
                const s = ["th", "st", "nd", "rd"];
                const v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            };

            const formatDate = (date: Date) => {
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
            };

            const age = calculateAge(new Date(learner.dateOfBirth));
            const ageOrdinal = getOrdinal(age);
            const bdayDate = formatDate(new Date(learner.dateOfBirth));
            const gradeName = formatTitleCase(learner.grade);
            const firstName = formatTitleCase(learner.firstName);
            const lastName = formatTitleCase(learner.lastName);
            const fullName = `${firstName} ${lastName}`;

            const message = msgTemplate
                .replace(/{learnerName}/g, fullName)
                .replace(/{firstName}/g, firstName)
                .replace(/{lastName}/g, lastName)
                .replace(/{schoolName}/g, schoolName)
                .replace(/{grade}/g, gradeName)
                .replace(/{age}/g, age.toString())
                .replace(/{ageOrdinal}/g, ageOrdinal)
                .replace(/{birthdayDate}/g, bdayDate);

            try {
                let result;
                if (channel === 'whatsapp') {
                    const cake = String.fromCodePoint(0x1F382);
                    const balloon = String.fromCodePoint(0x1F388);
                    const confetti = String.fromCodePoint(0x1F38A);
                    const sparkle = String.fromCodePoint(0x2728);
                    const premiumTemplate = `*Happy Birthday ${firstName}!* ${cake}${balloon}\n\n${schoolName} is thrilled to celebrate you on your *${ageOrdinal} birthday* today, ${bdayDate}! ${confetti} \n\nWe are so proud of your progress in *${gradeName}*. May your day be filled with joy, laughter, and wonderful memories. Keep shining bright! ${sparkle}\n\nBest wishes,\n*The ${schoolName} Family*`;

                    const finalMessage = channel === 'whatsapp' && !template
                        ? premiumTemplate
                        : message;

                    const { whatsappService } = await import('../services/whatsapp.service');
                    result = await whatsappService.sendMessage({
                        to: phoneNumber,
                        message: finalMessage
                    });
                } else {
                    result = await SmsService.sendSms(schoolId, phoneNumber, message);
                }

                results.push({
                    learnerId: learner.id,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error
                });
            } catch (err: any) {
                results.push({ learnerId: learner.id, success: false, error: err.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        res.status(200).json({
            message: `Processed ${results.length} birthday messages. ${successCount} sent, ${failCount} failed.`,
            results
        });

    } catch (error: any) {
        console.error('Send Birthday Wishes Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send messages' });
    }
};
