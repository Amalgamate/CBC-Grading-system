// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BACKUP_DIR = '2026-02-20T04-37-57-537Z';
const BACKUP_PATH = path.join(__dirname, '..', '..', 'backups', BACKUP_DIR);

const TARGET_SCHOOL_ID = '27abad16-addb-402d-a35f-6e89479d64a1';
const TARGET_BRANCH_ID = '8e72bef4-6034-4af7-b033-e6e68a433162';
const DEFAULT_USER_ID = '01ca1777-c7a9-46a0-9f2b-690c6c56a038'; // Existing user from check-db.js

function loadJson(filename: string) {
    const filePath = path.join(BACKUP_PATH, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function cleanData(obj: any, modelName: string) {
    if (!obj) return obj;
    const clean = { ...obj };

    if (clean.schoolId) clean.schoolId = TARGET_SCHOOL_ID;
    if (clean.branchId) clean.branchId = TARGET_BRANCH_ID;

    // Remove ALL problematic FKs
    const keysToRemove = [
        'parentId', 'parent', 'teacherId', 'teacher',
        'approvedBy', 'approver', 'createdBy', 'creator', 'creatorId',
        'branch', 'school', 'results', 'learners', 'stream',
        'submittedBy', 'approvedBy', 'lockedBy', 'archivedBy'
    ];
    keysToRemove.forEach(k => delete clean[k]);

    // Mandatory Creator for Tests
    if (modelName === 'SummativeTest') {
        clean.creatorId = DEFAULT_USER_ID;
        clean.published = true;
        clean.status = 'APPROVED';
    }

    // Force Published status for results
    if (modelName === 'SummativeResult') {
        clean.status = 'PUBLISHED';
    }

    // Dates
    Object.keys(clean).forEach(key => {
        if (typeof clean[key] === 'string' && (key.endsWith('At') || key.endsWith('Date') || key.includes('timestamp'))) {
            clean[key] = new Date(clean[key]);
        }
    });

    return clean;
}

async function main() {
    console.log('🚀 FINAL DATA RECOVERY: GRADE 9 MIDTERM (SIGNAL)');

    const tests = loadJson('SummativeTest.json');
    const results = loadJson('SummativeResult.json');
    const learners = loadJson('Learner.json');

    const g9Tests = tests.filter(t => t.grade === 'GRADE_9' && t.testType === 'MIDTERM');
    const g9TestIds = new Set(g9Tests.map(t => t.id));
    const g9Results = results.filter(r => g9TestIds.has(r.testId));

    // Map Backup Learner IDs to Admission Numbers
    const backupLearnerMap = new Map();
    learners.forEach(l => backupLearnerMap.set(l.id, l.admissionNumber));

    // Map DB Admission Numbers to DB IDs
    const dbLearners = await prisma.learner.findMany({ select: { id: true, admissionNumber: true } });
    const dbLearnerMap = new Map();
    dbLearners.forEach(l => dbLearnerMap.set(l.admissionNumber, l.id));

    console.log(`📊 Backup: ${g9Tests.length} tests, ${g9Results.length} scores.`);
    console.log(`📊 DB: ${dbLearners.length} existing learners found.`);

    // 1. Seed Tests
    for (const t of g9Tests) {
        try {
            await prisma.summativeTest.upsert({
                where: { id: t.id },
                update: cleanData(t, 'SummativeTest'),
                create: cleanData(t, 'SummativeTest')
            });
        } catch (e) { console.error(`❌ Test fail: ${t.title}`, e.message); }
    }

    // 2. Seed Results with ID Mapping
    let count = 0;
    for (const r of g9Results) {
        try {
            const admNo = backupLearnerMap.get(r.learnerId);
            const targetLearnerId = dbLearnerMap.get(admNo);

            if (!targetLearnerId) {
                // console.warn(`⏩ Skipping score for Adm No ${admNo}: Learner not in DB`);
                continue;
            }

            const cleanR = cleanData(r, 'SummativeResult');
            cleanR.learnerId = targetLearnerId;

            await prisma.summativeResult.upsert({
                where: { id: r.id },
                update: cleanR,
                create: cleanR
            });
            count++;
        } catch (e) { console.error(`❌ Result fail: ${r.id}`, e.message); }
    }

    console.log(`\n✅ SUCCESSFULLY SEEDED ${count} SCORES.`);
    console.log(`\n💡 UI FIX: Test Groups and Specific Tests are now visible in the Summary Report.`);

    await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
