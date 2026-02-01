
import axios from 'axios';
import prisma from '../config/database';
import { decrypt } from '../utils/encryption.util';

interface SendSmsResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider?: string;
}

interface AssessmentReportData {
    learnerId: string;
    learnerName: string;
    learnerGrade: string;
    parentPhone: string;
    parentName?: string;
    term: string;
    totalTests: number;
    averageScore?: string;
    overallGrade?: string;
    totalMarks?: number;
    maxPossibleMarks?: number;
    subjects?: Record<string, string | { score: number, grade: string }>;
    schoolId: string;
    sentByUserId?: string;
}

export class SmsService {
    /**
     * Normalize phone number to 254 format
     */
    private static formatPhoneNumber(phone: string): string {
        // Remove all non-digits
        let p = phone.replace(/\D/g, '');

        // Handle standard Kenyan formats
        if (p.startsWith('07') || p.startsWith('01')) {
            return '+254' + p.substring(1);
        }

        // If it's already 254...
        if (p.startsWith('254') && p.length === 12) {
            return '+' + p;
        }

        // If it's just 9 digits (712345678), add 254
        if (p.length === 9) {
            return '+254' + p;
        }

        return '+' + p;
    }

    /**
     * Send welcome SMS to new school admin
     */
    static async sendWelcomeSms(schoolId: string, phone: string, schoolName: string): Promise<SendSmsResult> {
        try {
            const formattedPhone = this.formatPhoneNumber(phone);
            const message = `Welcome to EDucore! Your school ${schoolName} is set up. Log in to your dashboard to get started.`;

            console.log(`📱 SMS Service: Sending welcome SMS to ${formattedPhone}`);
            return await this.sendSms(schoolId, formattedPhone, message);
        } catch (error: any) {
            console.error('Welcome SMS Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send assessment report SMS to parent
     */
    static async sendAssessmentReport(data: AssessmentReportData): Promise<SendSmsResult> {
        try {
            // Format phone number
            const formattedPhone = this.formatPhoneNumber(data.parentPhone);

            // 1. Get School Details for Header
            const school = await prisma.school.findUnique({
                where: { id: data.schoolId },
                select: { name: true }
            });

            const schoolName = (school?.name || 'Your School').toUpperCase();
            const parentGreeting = data.parentName ? `Dear ${data.parentName}` : 'Dear Parent';

            // 2. Build Subject Breakdown
            let subjectsSummary = '';
            if (data.subjects && Object.keys(data.subjects).length > 0) {
                const subArray = Object.entries(data.subjects).map(([name, detail]) => {
                    const code = name.length > 8 ? name.substring(0, 8).toUpperCase() : name.toUpperCase();
                    if (typeof detail === 'string') {
                        return `${code}: ${detail}`;
                    } else {
                        return `${code}: ${detail.score} ${detail.grade}`;
                    }
                });
                subjectsSummary = `\n\n${subArray.join('\n')}`;
            }

            // 3. Construct the multiline message
            const currentYear = new Date().getFullYear();
            const message = `FROM ${schoolName}\n\n` +
                `${parentGreeting},\n\n` +
                `Midterm Assessment, ${data.term}, ${currentYear}\n\n` +
                `NAME: ${data.learnerName}\n` +
                `GRADE: ${data.learnerGrade}\n\n` +
                `GRADE:${data.overallGrade || 'N/A'}\n` +
                `MEAN MARKS: ${data.averageScore || '0'}%\n` +
                `TOTAL MARKS: ${data.totalMarks || 0} / ${data.maxPossibleMarks || 0}` +
                `${subjectsSummary}`;

            console.log(`📱 SMS Service: Sending structured multiline SMS to ${formattedPhone}`);
            console.log(`📝 Message:\n${message}`);

            // Send SMS
            const result = await this.sendSms(data.schoolId, formattedPhone, message);

            // Create audit record
            await prisma.assessmentSmsAudit.create({
                data: {
                    learnerId: data.learnerId,
                    assessmentType: 'SUMMATIVE',
                    parentPhone: formattedPhone,
                    parentName: data.parentName || 'Unknown',
                    learnerName: data.learnerName,
                    learnerGrade: data.learnerGrade,
                    templateType: 'SUMMATIVE_TERM',
                    messageContent: message,
                    smsMessageId: result.messageId,
                    smsStatus: result.success ? 'SENT' : 'FAILED',
                    failureReason: result.error,
                    sentByUserId: data.sentByUserId,
                    schoolId: data.schoolId,
                }
            });

            return result;

        } catch (error: any) {
            console.error('Assessment Report SMS Error:', error);

            // Log failed attempt
            try {
                await prisma.assessmentSmsAudit.create({
                    data: {
                        learnerId: data.learnerId,
                        assessmentType: 'SUMMATIVE',
                        parentPhone: this.formatPhoneNumber(data.parentPhone),
                        parentName: data.parentName || 'Unknown',
                        learnerName: data.learnerName,
                        learnerGrade: data.learnerGrade,
                        templateType: 'SUMMATIVE_TERM',
                        messageContent: 'Failed to send',
                        smsStatus: 'FAILED',
                        failureReason: error.message,
                        sentByUserId: data.sentByUserId,
                        schoolId: data.schoolId,
                    }
                });
            } catch (auditError) {
                console.error('Failed to create audit record:', auditError);
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send SMS using the school's configuration
     */
    static async sendSms(schoolId: string, phone: string, message: string): Promise<SendSmsResult> {
        try {
            if (!schoolId || !phone || !message) {
                throw new Error('Missing required parameters');
            }

            // 1. Get School Configuration
            const config = await prisma.communicationConfig.findUnique({
                where: { schoolId }
            });

            if (!config) {
                return {
                    success: false,
                    error: 'SMS not configured for this school'
                };
            }

            if (!config.smsEnabled) {
                return {
                    success: false,
                    error: 'SMS is disabled for this school'
                };
            }

            // 2. Format phone number
            const formattedPhone = this.formatPhoneNumber(phone);

            // 3. Route to appropriate provider
            if (config.smsProvider === 'mobilesasa') {
                console.log(`🔄 Routing SMS to provider: MobileSasa`);
                return await this.sendViaMobileSasa(config, formattedPhone, message);
            } else if (config.smsProvider === 'custom') {
                console.log(`🔄 Routing SMS to provider: Custom`);
                return await this.sendViaCustomProvider(config, formattedPhone, message);
            } else {
                console.log(`❌ Unknown SMS provider: ${config.smsProvider}`);
                return {
                    success: false,
                    error: 'Unknown SMS provider'
                };
            }

        } catch (error: any) {
            console.error('SMS Service Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send via MobileSasa
     */
    private static async sendViaMobileSasa(config: any, phone: string, message: string): Promise<SendSmsResult> {
        try {
            if (!config.smsApiKey) {
                return { success: false, error: 'MobileSasa API key not configured' };
            }

            const apiKey = decrypt(config.smsApiKey);
            const senderId = config.smsSenderId || 'ZAWADI'; // Fallback per requirement
            const baseUrl = config.smsBaseUrl || 'https://api.mobilesasa.com';

            // MobileSasa API Implementation
            // Endpoint: /v1/send/message
            const response = await axios.post(
                `${baseUrl}/v1/send/message`,
                {
                    senderID: senderId,
                    message: message,
                    phone: phone
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && (response.data.status === 'success' || response.status === 200)) {
                console.log(`✅ MobileSasa Response:`, JSON.stringify(response.data));
                return {
                    success: true,
                    messageId: response.data.messageId || response.data.messageID || response.data.data?.messageId,
                    provider: 'mobilesasa'
                };
            } else {
                console.log(`❌ MobileSasa Failure Response:`, JSON.stringify(response.data));
                return {
                    success: false,
                    error: response.data?.message || 'MobileSasa API returned error status',
                    provider: 'mobilesasa'
                };
            }

        } catch (error: any) {
            console.error('MobileSasa Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                provider: 'mobilesasa'
            };
        }
    }

    /**
     * Send via Custom Provider (Generic Webhook)
     */
    private static async sendViaCustomProvider(config: any, phone: string, message: string): Promise<SendSmsResult> {
        try {
            if (!config.customSmsUrl) {
                return { success: false, error: 'Custom SMS URL not configured' };
            }

            const url = config.customSmsUrl;
            const headers: any = { 'Content-Type': 'application/json' };

            if (config.customSmsToken) {
                const token = decrypt(config.customSmsToken);
                const authHeader = config.customSmsAuthHeader || 'Authorization';
                headers[authHeader] = token; // e.g. "Bearer <token>" or just "<token>" depending on user input
            }

            // We assume a standard payload, or user might need to configure payload mapping (out of scope for now)
            // Sending generic payload
            const payload = {
                to: phone,
                phone: phone,
                message: message,
                text: message,
                sender: config.customSmsName
            };

            const response = await axios.post(url, payload, { headers });

            if (response.status >= 200 && response.status < 300) {
                return { success: true, provider: 'custom' };
            } else {
                return { success: false, error: `Custom provider returned status ${response.status}`, provider: 'custom' };
            }

        } catch (error: any) {
            return { success: false, error: error.message, provider: 'custom' };
        }
    }
}
