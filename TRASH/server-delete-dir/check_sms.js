
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSmsAudit() {
    try {
        const audits = await prisma.assessmentSmsAudit.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        console.log('--- DETAILED SMS AUDITS ---');
        audits.forEach(a => {
            console.log(`ID: ${a.id}`);
            console.log(`Time: ${a.createdAt.toISOString()}`);
            console.log(`Learner: ${a.learnerName}`);
            console.log(`Recipient: ${a.parentPhone}`);
            console.log(`Status: ${a.smsStatus}`);
            console.log(`MsgId: ${a.smsMessageId}`);
            console.log(`Content Len: ${a.messageContent ? a.messageContent.length : 0}`);
            console.log(`Error: ${a.failureReason || 'None'}`);
            console.log('---');
        });

        const configs = await prisma.communicationConfig.findMany();
        console.log('\n--- COMM CONFIGS ---');
        configs.forEach(c => {
            console.log(`SchoolId: ${c.schoolId}`);
            console.log(`SMS Enabled: ${c.smsEnabled}`);
            console.log(`Provider: ${c.smsProvider}`);
            console.log(`Sender ID: ${c.smsSenderId || 'DEFAULT'}`);
        });
    } catch (err) {
        console.error('Audit Check Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkSmsAudit();
