import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureSmsConfig() {
    console.log('🔍 Checking SMS Configuration...');
    try {
        const schools = await prisma.school.findMany({
            include: {
                communicationConfig: true
            }
        });

        for (const school of schools) {
            console.log(`School: ${school.name} (${school.id})`);
            if (!school.communicationConfig) {
                console.log('  ❌ No communication config found. Creating one...');
                await prisma.communicationConfig.create({
                    data: {
                        schoolId: school.id,
                        smsEnabled: true,
                        smsProvider: 'mobilesasa',
                        smsSenderId: 'MOBILESASA'
                    }
                });
                console.log('  ✅ Created default SMS config (Enabled).');
            } else {
                console.log(`  ✅ Config found: provider=${school.communicationConfig.smsProvider}, enabled=${school.communicationConfig.smsEnabled}`);
                if (!school.communicationConfig.smsEnabled) {
                    console.log('  🔄 Enabling SMS...');
                    await prisma.communicationConfig.update({
                        where: { schoolId: school.id },
                        data: { smsEnabled: true }
                    });
                }
                if (school.communicationConfig.smsSenderId === 'ZAWADI') {
                    console.log('  🔄 Updating Sender ID to MOBILESASA...');
                    await prisma.communicationConfig.update({
                        where: { schoolId: school.id },
                        data: { smsSenderId: 'MOBILESASA' }
                    });
                }
            }
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message || error);
    } finally {
        await prisma.$disconnect();
    }
}

ensureSmsConfig();
