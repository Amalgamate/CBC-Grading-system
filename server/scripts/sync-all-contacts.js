const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const CSV_PATH = 'c:/Amalgamate/Projects/EDucore/data/Students Database.csv';

    console.log('--- STARTING ALL GRADES CONTACT SYNC ---');

    // 1. Read CSV Data
    const workbook = xlsx.readFile(CSV_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = xlsx.utils.sheet_to_json(sheet);

    console.log(`Read ${csvData.length} total rows from CSV.`);

    let updatedCount = 0;
    let missedCount = 0;

    // Helper to format phone numbers
    const formatPhone = (p) => {
        if (!p) return null;
        let clean = String(p).replace(/\D/g, '');
        if (clean.length === 0) return null;
        if (clean.startsWith('0')) clean = '254' + clean.substring(1);
        if (clean.length === 9) clean = '254' + clean;
        // Basic validation for Kenyan numbers (12 digits starting with 254)
        if (clean.length === 12 && clean.startsWith('254')) return clean;
        return clean; // Return best effort
    };

    // Prefetch all learners for efficiency (map by admissionNumber)
    const allLearners = await prisma.learner.findMany({
        select: { id: true, admissionNumber: true, firstName: true, lastName: true, parentId: true, guardianName: true }
    });

    const learnerMap = new Map();
    allLearners.forEach(l => {
        if (l.admissionNumber) {
            learnerMap.set(l.admissionNumber.toString(), l);
        }
    });

    console.log(`Loaded ${allLearners.length} learners from DB.`);

    for (const row of csvData) {
        const admNo = String(row['Adm No']).trim();
        const learnerName = row['Leaner Name'];
        const parentName = row['Parent/Guardian'];
        const phone1 = row['Phone 1'];
        const phone2 = row['Phone 2'];

        const targetPhone = formatPhone(phone1) || formatPhone(phone2);

        if (!targetPhone) {
            // console.log(`[SKIP] No phone number for ${learnerName} (Adm: ${admNo})`);
            continue;
        }

        const learner = learnerMap.get(admNo);

        if (!learner) {
            // console.log(`[MISS] No learner found in DB with Admission No: ${admNo} (${learnerName})`);
            missedCount++;
            continue;
        }

        // Update Learner and Parent Phone
        await prisma.learner.update({
            where: { id: learner.id },
            data: {
                guardianPhone: targetPhone,
                guardianName: parentName || learner.guardianName
            }
        });

        if (learner.parentId) {
            await prisma.user.update({
                where: { id: learner.parentId },
                data: { phone: targetPhone }
            });
        }

        updatedCount++;
        if (updatedCount % 50 === 0) process.stdout.write('.');
    }

    console.log('\n--- SYNC COMPLETE ---');
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Missed/Not Found in DB: ${missedCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
