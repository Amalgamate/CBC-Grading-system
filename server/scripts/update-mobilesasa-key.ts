
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/utils/encryption.util';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateMobileSasaKey() {
    const apiKey = process.env.MOBILESASA_API_KEY;

    if (!apiKey) {
        console.error('❌ MOBILESASA_API_KEY not found in environment variables');
        process.exit(1);
    }

    console.log('🔄 Updating MobileSasa API key for existing schools...');

    try {
        const encryptedKey = encrypt(apiKey);

        const configs = await prisma.communicationConfig.findMany({
            where: {
                smsProvider: 'mobilesasa'
            }
        });

        console.log(`Found ${configs.length} configs to check.`);

        let updatedCount = 0;

        for (const config of configs) {
            await prisma.communicationConfig.update({
                where: { id: config.id },
                data: {
                    smsApiKey: encryptedKey,
                    hasApiKey: true,
                    smsBaseUrl: 'https://api.mobilesasa.com', // Ensure base URL is set
                    smsSenderId: process.env.SMS_SENDER_ID || 'MOBILESASA'
                }
            });
            updatedCount++;
            console.log(`✅ Updated config for school: ${config.schoolId}`);
        }

        console.log(`\n🎉 Successfully updated ${updatedCount} communication configurations.`);
    } catch (error) {
        console.error('❌ Error updating configs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateMobileSasaKey();
