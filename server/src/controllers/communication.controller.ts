import { Request, Response } from 'express';
import prisma from '../config/database';
import { encrypt } from '../utils/encryption.util';
import { SmsService } from '../services/sms.service';
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
                    hasApiKey: !!config.emailApiKey
                },
                mpesa: {
                    enabled: config.mpesaEnabled,
                    provider: config.mpesaProvider,
                    publicKey: config.mpesaPublicKey,
                    businessNumber: config.mpesaBusinessNo,
                    hasSecretKey: !!config.mpesaSecretKey
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
        const { schoolId, sms, email, mpesa } = req.body;

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
