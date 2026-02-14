import axios from 'axios';
import prisma from '../config/database';
import { decrypt } from '../utils/encryption.util';
import { SMS_MESSAGES, LEARNING_AREA_ABBREVIATIONS } from '../config/communication.messages';

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
            const message = SMS_MESSAGES.welcome(schoolName);

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

            // 2. Build Subject Breakdown with Standard Abbreviations
            let subjectsSummary = '';
            if (data.subjects && Object.keys(data.subjects).length > 0) {
                const subArray = Object.entries(data.subjects).map(([name, detail]) => {
                    const upper = name.toUpperCase().trim();
                    const code = LEARNING_AREA_ABBREVIATIONS[upper] || (name.length > 8 ? name.substring(0, 8).toUpperCase() : name.toUpperCase());

                    if (typeof detail === 'string') {
                        return `${code}: ${detail}`;
                    } else {
                        return `${code}: ${detail.score} ${detail.grade}`;
                    }
                });
                subjectsSummary = `\n\n${subArray.join('\n')}`;
            }

            // 3. Construct the message using config template
            const message = SMS_MESSAGES.assessmentReport({
                schoolName,
                parentName: data.parentName,
                learnerName: data.learnerName,
                learnerGrade: data.learnerGrade,
                term: data.term,
                overallGrade: data.overallGrade,
                averageScore: data.averageScore,
                totalMarks: data.totalMarks,
                maxPossibleMarks: data.maxPossibleMarks
            }) + subjectsSummary;

            console.log(`📱 SMS Service: Sending structured multiline SMS to ${formattedPhone}`);
            console.log(`📝 Message:\n${message}`);

            // Send SMS
            const result = await this.sendSms(data.schoolId, formattedPhone, message);

            // Create audit record
            await prisma.assessmentSmsAudit.create({
                data: {
                    learnerId: data.learnerId,
                    assessmentType: 'SUMMATIVE',
                    term: data.term,
                    academicYear: new Date().getFullYear(), // Default to current year if not provided
                    parentPhone: formattedPhone,
                    parentName: data.parentName || 'Unknown',
                    learnerName: data.learnerName,
                    learnerGrade: data.learnerGrade,
                    templateType: 'SUMMATIVE_TERM',
                    messageContent: message,
                    channel: 'SMS',
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
     * Send fee invoice notification to parent
     */
    static async sendFeeInvoiceNotification(data: {
        schoolId: string;
        parentPhone: string;
        parentName: string;
        learnerName: string;
        invoiceNumber: string;
        term: string;
        amount: number;
        dueDate: string;
    }): Promise<SendSmsResult> {
        try {
            const formattedPhone = this.formatPhoneNumber(data.parentPhone);
            const school = await prisma.school.findUnique({
                where: { id: data.schoolId },
                select: { name: true }
            });
            const schoolName = (school?.name || 'School').toUpperCase();

            // Short, concise message for SMS
            const message = `Dear ${data.parentName}, an invoice (${data.invoiceNumber}) of KES ${data.amount.toLocaleString()} for ${data.learnerName} (${data.term}) has been generated. Due: ${data.dueDate}. Please ensure timely payment. - ${schoolName}`;

            console.log(`📱 SMS Service: Sending Fee Invoice SMS to ${formattedPhone}`);
            return await this.sendSms(data.schoolId, formattedPhone, message);
        } catch (error: any) {
            console.error('Fee Invoice SMS Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send SMS using the school's configured provider.
     * This is the central method for dispatching SMS.
     */
    static async sendSms(schoolId: string, phone: string, message: string): Promise<SendSmsResult> {
        console.log(`[SmsService] Initiating SMS send for school: ${schoolId}`);
        try {
            if (!schoolId || !phone || !message) {
                console.error('[SmsService] Validation Error: Missing required parameters.', { schoolId, phone: !!phone, message: !!message });
                throw new Error('Missing required parameters for sending SMS.');
            }

            // 1. Get School's Communication Configuration
            const config = await prisma.communicationConfig.findUnique({
                where: { schoolId }
            });

            if (!config) {
                console.error(`[SmsService] Configuration Error: SMS not configured for school ${schoolId}.`);
                return { success: false, error: 'SMS service is not configured for this school.' };
            }

            if (!config.smsEnabled) {
                console.warn(`[SmsService] SMS is disabled for school ${schoolId}.`);
                return { success: false, error: 'SMS service is disabled for this school.' };
            }

            // 2. Format phone number
            const formattedPhone = this.formatPhoneNumber(phone);
            console.log(`[SmsService] Phone number ${phone} formatted to ${formattedPhone}.`);

            // 3. Route to the appropriate provider
            const provider = config.smsProvider?.toLowerCase();
            console.log(`[SmsService] Routing to SMS provider: ${provider}`);

            switch (provider) {
                case 'africastalking':
                    return this.sendViaAfricasTalking(config, formattedPhone, message);
                case 'mobilesasa':
                    return this.sendViaMobileSasa(config, formattedPhone, message);
                default:
                    console.error(`[SmsService] Configuration Error: Unknown or unsupported SMS provider "${provider}" for school ${schoolId}.`);
                    return { success: false, error: `SMS provider "${provider}" is not supported.` };
            }
        } catch (error: any) {
            console.error(`[SmsService] Critical Error in sendSms: ${error.message}`, {
                stack: error.stack,
                schoolId,
            });
            return {
                success: false,
                error: 'A server error occurred while attempting to send the SMS.'
            };
        }
    }

    /**
     * Send SMS via MobileSasa
     */
    private static async sendViaMobileSasa(config: any, phone: string, message: string): Promise<SendSmsResult> {
        console.log(`[SmsService] Sending via MobileSasa to ${phone}.`);
        try {
            if (!config.smsApiKey) {
                console.error('[SmsService-MobileSasa] Missing API Key.');
                return { success: false, error: "MobileSasa API key is not configured." };
            }

            const apiKey = decrypt(config.smsApiKey);
            const senderId = config.smsSenderId || 'MOBILESASA';
            const baseUrl = config.smsBaseUrl || 'https://api.mobilesasa.com';

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

            console.log('[SmsService-MobileSasa] API Response:', response.data);

            // Assuming a successful response contains a messageId or similar identifier
            if (response.data && response.status === 200) {
                return {
                    success: true,
                    messageId: response.data.messageId || 'N/A',
                    provider: 'mobilesasa'
                };
            } else {
                throw new Error(response.data.message || 'Unknown error from MobileSasa');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error(`[SmsService-MobileSasa] Failed to send SMS: ${errorMessage}`, {
                status: error.response?.status,
                data: error.response?.data
            });
            return { success: false, error: `MobileSasa: ${errorMessage}` };
        }
    }

    /**
     * Send SMS via Africa's Talking
     */
    private static async sendViaAfricasTalking(config: any, phone: string, message: string): Promise<SendSmsResult> {
        console.log(`[SmsService] Sending via Africa's Talking to ${phone}.`);
        try {
            const apiKey = config.smsApiKey ? decrypt(config.smsApiKey) : null;
            const username = config.smsUsername; // This is the AT username stored in DB

            if (!apiKey || !username) {
                console.error("[SmsService-AT] Missing credentials.", {
                    hasApiKey: !!apiKey,
                    hasUsername: !!username,
                    dbFields: { smsApiKey: config.smsApiKey ? 'present' : 'missing', smsUsername: config.smsUsername }
                });
                return { success: false, error: "Africa's Talking API Key and Username are required." };
            }

            // For Africa's Talking, the senderId/from is often a shortcode or alphanumeric, managed on their platform
            const from = config.smsSenderId; // This should be your AT Sender ID

            const params = new URLSearchParams();
            params.append('username', username);
            params.append('to', phone);
            params.append('message', message);
            if (from) {
                params.append('from', from);
            }

            console.log("[SmsService-AT] Request parameters:", {
                username,
                to: phone,
                from: from || 'not set',
                messageLength: message.length
            });

            const response = await axios.post(
                'https://api.africastalking.com/version1/messaging',
                params.toString(),
                {
                    headers: {
                        'apikey': apiKey,
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log("[SmsService-AT] API Response:", response.data);

            const smsData = response.data?.SMSMessageData;
            if (smsData && smsData.Recipients?.[0]?.status === 'Success') {
                console.log("[SmsService-AT] ✅ SMS sent successfully");
                return {
                    success: true,
                    messageId: smsData.Recipients[0].messageId,
                    provider: 'africastalking'
                };
            } else {
                const reason = smsData?.Recipients?.[0]?.status || smsData?.Message || 'Unknown reason';
                console.error(`[SmsService-AT] Send failed with status: ${reason}`);
                throw new Error(`Failed to send. Reason: ${reason}`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.SMSMessageData?.Message || error.message;
            console.error(`[SmsService-AT] Failed to send SMS: ${errorMessage}`, {
                status: error.response?.status,
                data: error.response?.data
            });
            return { success: false, error: `Africa's Talking: ${errorMessage}` };
        }
    }
}
