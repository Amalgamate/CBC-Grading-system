const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const CSV_PATH = 'c:/Amalgamate/Projects/EDucore/data/Students Database.csv';

    console.log('--- STARTING GRADE 1 CONTACT SYNC ---');

    // 1. Read CSV Data
    const workbook = xlsx.readFile(CSV_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = xlsx.utils.sheet_to_json(sheet);

    console.log(`Read ${csvData.length} total rows from CSV.`);

    // 2. Filter for Grade 1
    const grade1Rows = csvData.filter(row => row['Class'] === 'Grade 1');
    console.log(`Found ${grade1Rows.length} Grade 1 rows in CSV.`);

    let updatedCount = 0;
    let missedCount = 0;

    for (const row of grade1Rows) {
        const admNo = String(row['Adm No']).trim();
        const learnerName = row['Leaner Name'];
        const parentName = row['Parent/Guardian'];
        const phone1 = String(row['Phone 1']).trim();
        const phone2 = String(row['Phone 2']).trim();

        // Standardize phone number for Kenya (254)
        const formatPhone = (p) => {
            if (!p) return null;
            let clean = p.replace(/\D/g, '');
            if (clean.startsWith('0')) clean = '254' + clean.substring(1);
            if (clean.length === 9) clean = '254' + clean;
            return clean;
        };

        const targetPhone = formatPhone(phone1) || formatPhone(phone2);

        if (!targetPhone) {
            console.log(`[SKIP] No phone number for ${learnerName} (Adm: ${admNo})`);
            continue;
        }

        // 3. Find Learner in DB
        const learner = await prisma.learner.findFirst({
            where: { admissionNumber: admNo },
            include: { parent: true }
        });

        if (!learner) {
            console.log(`[MISS] No learner found in DB with Admission No: ${admNo} (${learnerName})`);
            missedCount++;
            continue;
        }

        // 4. Update Learner and Parent Phone
        console.log(`[SYNC] Updating ${learnerName} (Adm: ${admNo}) -> Phone: ${targetPhone}`);

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
            console.log(`       - Also updated Parent User record (ID: ${learner.parentId})`);
        }

        updatedCount++;
    }

    console.log('\n--- SYNC COMPLETE ---');
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Missed/Not Found:  ${missedCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
