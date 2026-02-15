import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

// Encryption key from .env
const ENCRYPTION_KEY = "a7717e3303d6db20b50335f9eca03203de1526bbcce516085692fa0ca9f066490";

function encryptGCM(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

async function fixProductionEncryption() {
  try {
    console.log("🔐 Fixing production SMS API key encryption...\n");

    // MobileSasa API Key
    const apiKey = "UrkwuO5UfKfN6wuwwQPG3KkCfIvtgiWOa0EPcGb7R1r5JsVSxgEz4zR0fSdq";

    // Encrypt with proper GCM format
    const encrypted = encryptGCM(apiKey);
    console.log(`Original API Key: ${apiKey}`);
    console.log(`Encrypted (GCM): ${encrypted}\n`);

    // Get all schools with mobilesasa config
    const schools = await prisma.communicationConfig.findMany({
      where: {
        smsProvider: 'mobilesasa'
      }
    });

    console.log(`Found ${schools.length} schools with MobileSasa config\n`);

    // Update all with proper encryption
    for (const school of schools) {
      await prisma.communicationConfig.update({
        where: { id: school.id },
        data: {
          smsApiKey: encrypted
        }
      });
      console.log(`✅ Updated school: ${school.schoolId}`);
    }

    console.log("\n✅ Production SMS encryption fixed!");
    console.log("\n🎯 All schools now have properly encrypted API keys in GCM format");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionEncryption();
