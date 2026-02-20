const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const schools = await prisma.school.findMany({ select: { id: true, name: true } });
    const branches = await prisma.branch.findMany({ select: { id: true, name: true, schoolId: true } });
    const learners = await prisma.learner.findMany({ select: { id: true, admissionNumber: true, firstName: true } });
    const users = await prisma.user.findMany({ take: 5, select: { id: true, firstName: true, email: true } });
    console.log('--- Schools in DB ---');
    console.log(JSON.stringify(schools, null, 2));
    console.log('--- Branches in DB ---');
    console.log(JSON.stringify(branches, null, 2));
    console.log('--- Learners in DB ---');
    console.log(JSON.stringify(learners, null, 2));
    console.log('--- Users in DB ---');
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}

main().catch(console.error);
