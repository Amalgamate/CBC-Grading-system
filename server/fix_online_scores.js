
const { PrismaClient } = require('@prisma/client');

// Use the production database URL directly to apply fix
const remoteUrl = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: remoteUrl,
        },
    },
});

async function main() {
    const admNos = ['1210', '856'];

    console.log("=== FIXING MISSING TEST TYPES ONLINE ===");

    for (const adm of admNos) {
        const learner = await prisma.learner.findFirst({
            where: { admissionNumber: adm },
            include: {
                summativeResults: {
                    include: { test: true }
                }
            }
        });

        if (!learner) {
            console.log(`Learner ${adm} not found.`);
            continue;
        }

        // Identify results with null test type (or null test relation if that's the issue)
        // Actually, SummativeResult doesn't have testType directly usually, it relies on Test.
        // Wait, my debug output showed "TestType" column as 'null' for 6 subjects.
        // And 'OPENER' for 2.
        // This implies the `Test` object has `testType`.
        // So we need to update the `Test` object, NOT the `SummativeResult`.

        // Let's check the test IDs.
        // If multiple results share the same test ID, updating the test updates all results.
        // If each result has a unique test ID (which is likely if they are different subjects), we update each test.

        const results = learner.summativeResults;

        for (const r of results) {
            if (!r.test) {
                console.log(`Result ${r.id} has NO test relation.`);
                continue;
            }

            if (!r.test.testType || r.test.testType === 'null') {
                console.log(`Updating Test ${r.testId} (${r.test.learningArea}) from ${r.test.testType} to OPENER...`);
                await prisma.summativeTest.update({
                    where: { id: r.testId },
                    data: { testType: 'OPENER' }
                });
            }
        }
    }

    console.log("=== FIX COMPLETE ===");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
