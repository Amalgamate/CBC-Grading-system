
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTests() {
    console.log('📋 Checking SummativeTest records...');

    const tests = await prisma.summativeTest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });

    if (tests.length === 0) {
        console.log('❌ No tests found.');
        return;
    }

    tests.forEach(t => {
        console.log(`- ID: ${t.id}`);
        console.log(`  Title: ${t.title}`);
        console.log(`  Type: ${t.testType}`);
        console.log(`  Term: ${t.term}`);
        console.log(`  Year: ${t.academicYear}`);
        console.log(`  Grade: ${t.grade}`);
        console.log('-------------------');
    });
}

checkTests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
