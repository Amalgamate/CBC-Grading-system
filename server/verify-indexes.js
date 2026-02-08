const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyIndexes() {
    try {
        console.log('🔍 Verifying tactical indexes...');

        const tablesToCheck = ['learners', 'summative_results', 'formative_assessments', 'summative_tests', 'class_enrollments'];

        for (const table of tablesToCheck) {
            console.log(`\nTable: ${table}`);
            const indexes = await prisma.$queryRawUnsafe(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = '${table}';`);
            indexes.forEach(idx => {
                console.log(` - ${idx.indexname}`);
                // console.log(`   Def: ${idx.indexdef}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyIndexes();
