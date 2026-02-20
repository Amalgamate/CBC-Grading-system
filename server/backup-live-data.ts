import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups', timestamp);

    if (!fs.existsSync(backupDir)) {
        console.log(`📂 Creating backup directory: ${backupDir}`);
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('🚀 Starting FULL DATA BACKUP...');

    // Helper to dump table
    const dumpTable = async (modelName: string, delegate: any) => {
        console.log(`   📦 Backing up ${modelName}...`);
        try {
            const data = await delegate.findMany();
            const filePath = path.join(backupDir, `${modelName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`      ✅ Saved ${data.length} records to ${modelName}.json`);
        } catch (e) {
            console.error(`      ❌ Failed to backup ${modelName}:`, e);
        }
    };

    // 1. Core Data
    await dumpTable('School', prisma.school);
    await dumpTable('Branch', prisma.branch);
    await dumpTable('User', prisma.user);
    await dumpTable('Learner', prisma.learner);

    // 2. Academics & Scores (CRITICAL)
    await dumpTable('SummativeTest', prisma.summativeTest);
    await dumpTable('SummativeResult', prisma.summativeResult);
    await dumpTable('FormativeAssessment', prisma.formativeAssessment);
    await dumpTable('LearningArea', prisma.learningArea);
    await dumpTable('GradingSystem', prisma.gradingSystem);
    await dumpTable('TermlyReportComment', prisma.termlyReportComment);

    // 3. Finance
    await dumpTable('FeeStructure', prisma.feeStructure);
    await dumpTable('FeeInvoice', prisma.feeInvoice);
    await dumpTable('FeePayment', prisma.feePayment);

    console.log(`\n🎉 Backup completed successfully! Files are in: ${backupDir}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
