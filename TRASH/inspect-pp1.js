const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const pp1Results = await prisma.summativeResult.findMany({
            where: {
                learner: {
                    grade: 'PP1'
                }
            },
            include: {
                learner: true,
                test: true
            }
        });

        console.log(`Found ${pp1Results.length} PP1 results.`);

        // Group by learner
        const byLearner = {};
        pp1Results.forEach(r => {
            const learner = r.learner;
            const test = r.test;
            const key = `${learner.firstName} ${learner.lastName} (${learner.admissionNumber})`;
            if (!byLearner[key]) byLearner[key] = [];
            byLearner[key].push({
                area: test.learningArea,
                type: test.testType,
                score: r.marksObtained,
                total: test.totalMarks,
                title: test.title
            });
        });

        const learnerKeys = Object.keys(byLearner);
        console.log(`Unique Learners: ${learnerKeys.length}`);

        learnerKeys.slice(0, 10).forEach(key => {
            console.log(`\nLearner: ${key}`);
            byLearner[key].forEach(res => {
                console.log(`  - ${res.area} (${res.type}): ${res.score}/${res.total} [${res.title}]`);
            });
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
