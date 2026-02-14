import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

const SCHOOL_ID = 'cd01e480-117b-48ca-9b16-3c829f0337ff';
const BRANCH_ID = '729dce71-511a-413e-b7f1-087c14cddf2a';

function normalizeName(name: string): string {
    return name?.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ') || '';
}

function getTokens(name: string): string[] {
    return normalizeName(name).split(' ').filter(t => t.length > 2);
}

function isMatch(dbName: string, targetName: string): boolean {
    const db = normalizeName(dbName);
    const target = normalizeName(targetName);
    if (db === target) return true;

    const dbTokens = getTokens(dbName);
    const targetTokens = getTokens(targetName);

    if (dbTokens.length === 0) return false;

    // Strict word presence: all tokens of DB name must be in Target name
    return dbTokens.every(t => targetTokens.some(tt => tt.includes(t) || t.includes(tt)));
}

async function main() {
    console.log('🔄 Starting "Double Match" (Student/Parent Name) Refinement...');

    const csvPath = path.join(__dirname, '..', '..', 'templates', 'Students Database.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ Students Database.csv not found');
        return;
    }

    const workbook = XLSX.readFile(csvPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = XLSX.utils.sheet_to_json(sheet) as any[];

    // Extract student and parent name lists for matching
    const studentRecords: { name: string, info: any }[] = [];
    const parentRecords: { name: string, info: any }[] = [];

    csvData.forEach(row => {
        const info = {
            admissionNumber: row['Adm No']?.toString().trim(),
            parentName: row['Parent/Guardian']?.toString().trim(),
            phone1: row['Phone 1']?.toString().trim(),
            phone2: row['Phone 2']?.toString().trim(),
        };
        if (row['Leaner Name']) studentRecords.push({ name: row['Leaner Name'], info });
        if (row['Parent/Guardian']) parentRecords.push({ name: row['Parent/Guardian'], info });
    });

    console.log(`✅ Loaded ${studentRecords.length} student records and ${parentRecords.length} parent records.`);

    const learners = await prisma.learner.findMany({ where: { schoolId: SCHOOL_ID } });
    console.log(`📋 Processing ${learners.length} learners...`);

    let matchedAsStudent = 0;
    let matchedAsParent = 0;
    let updatedCount = 0;
    const misses: string[] = [];

    for (const learner of learners) {
        const fullName = `${learner.firstName} ${learner.lastName}`;
        let matchedInfo = null;

        // 1. Try match by Student Name
        const sMatch = studentRecords.find(r => isMatch(fullName, r.name));
        if (sMatch) {
            matchedInfo = sMatch.info;
            matchedAsStudent++;
        } else {
            // 2. Try match by Parent Name (Excel used parent name as student)
            const pMatch = parentRecords.find(r => isMatch(fullName, r.name));
            if (pMatch) {
                matchedInfo = pMatch.info;
                matchedAsParent++;
            }
        }

        if (matchedInfo) {
            // Upsert Parent User
            let parentId = null;
            if (matchedInfo.phone1) {
                const parentUser = await prisma.user.upsert({
                    where: { email: `${matchedInfo.phone1}@educore.com` },
                    update: {
                        firstName: matchedInfo.parentName?.split(' ')[0] || 'Parent',
                        lastName: matchedInfo.parentName?.split(' ').slice(1).join(' ') || 'User',
                        phone: matchedInfo.phone1,
                        role: UserRole.PARENT,
                        status: UserStatus.ACTIVE
                    },
                    create: {
                        email: `${matchedInfo.phone1}@educore.com`,
                        password: '$2a$10$7/O6jMvA1m98v0tYI8E/8u9z6n5z6n5z6n5z6n5z6n5z6n5z6n5z',
                        firstName: matchedInfo.parentName?.split(' ')[0] || 'Parent',
                        lastName: matchedInfo.parentName?.split(' ').slice(1).join(' ') || 'User',
                        phone: matchedInfo.phone1,
                        role: UserRole.PARENT,
                        status: UserStatus.ACTIVE,
                        schoolId: SCHOOL_ID,
                        branchId: BRANCH_ID
                    }
                });
                parentId = parentUser.id;
            }

            // Update Learner details
            if (learner.admissionNumber !== matchedInfo.admissionNumber || learner.parentId !== parentId) {
                await prisma.learner.update({
                    where: { id: learner.id },
                    data: {
                        admissionNumber: matchedInfo.admissionNumber || learner.admissionNumber,
                        guardianName: matchedInfo.parentName,
                        guardianPhone: matchedInfo.phone1,
                        emergencyPhone: matchedInfo.phone2,
                        parentId: parentId
                    }
                });
                updatedCount++;
            }
        } else {
            misses.push(`${fullName} (${learner.grade})`);
        }
    }

    if (misses.length > 0) {
        console.log('\n❌ Remaining Misses:');
        misses.forEach(m => console.log(` - ${m}`));
    }

    console.log(`\n✨ Final Summary:`);
    console.log(`- Total: ${learners.length}`);
    console.log(`- Matched as Student: ${matchedAsStudent}`);
    console.log(`- Matched as Parent: ${matchedAsParent}`);
    console.log(`- Total Matched: ${matchedAsStudent + matchedAsParent}`);
    console.log(`- Database records updated: ${updatedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
