const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Broadcast Logic Diagnosis ---');

        // 1. Get a School ID
        const school = await prisma.school.findFirst();
        if (!school) {
            console.error('No school found!');
            return;
        }
        const schoolId = school.id;
        console.log(`Using School ID: ${schoolId} (${school.name})`);

        // 2. Simulate "All Grades" query
        console.log('\n--- Simulating "All Grades" Query ---');
        const allLearners = await prisma.learner.findMany({
            where: {
                schoolId: schoolId,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                grade: true,
                guardianName: true,
                guardianPhone: true,
                parent: {
                    select: {
                        phone: true,
                        firstName: true
                    }
                }
            }
        });

        console.log(`Found ${allLearners.length} ACTIVE learners.`);

        // Check for specific Grade 5
        const grade5 = allLearners.filter(l => l.grade === 'GRADE_5');
        console.log(`\n- Grade 5 Learners: ${grade5.length}`);
        if (grade5.length > 0) {
            console.log('Sample Grade 5 Record:');
            console.log(JSON.stringify(grade5[0], null, 2));
        }

        // Check for PP1
        const pp1 = allLearners.filter(l => l.grade === 'PP1');
        console.log(`- PP1 Learners: ${pp1.length}`);

        // 3. Simulate Logic for Recipients
        console.log('\n--- Checking Contact Resolution (Sample) ---');
        let recipientCount = 0;
        allLearners.slice(0, 5).forEach(l => {
            const phone = l.guardianPhone || l.parent?.phone;
            const name = l.guardianName || l.parent?.firstName || 'Parent';
            console.log(`Student: ${l.firstName} ${l.lastName} | Contact: ${name} (${phone})`);
            if (phone) recipientCount++;
        });

        console.log(`\nTotal Recipients Logic Test (First 5): ${recipientCount}/5 have contacts.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
