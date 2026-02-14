import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Schools ---');
    try {
        const schools = await prisma.school.findMany({
            select: { id: true, name: true }
        });
        console.log(JSON.stringify(schools, null, 2));
    } catch (e) {
        console.error('Error fetching schools:', e);
    }

    console.log('\n--- Branches ---');
    try {
        const branches = await prisma.branch.findMany({
            select: { id: true, name: true, schoolId: true }
        });
        console.log(JSON.stringify(branches, null, 2));
    } catch (e) {
        console.error('Error fetching branches:', e);
    }

    console.log('\n--- Admins ---');
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, email: true, schoolId: true }
        });
        console.log(JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error('Error fetching admins:', e);
    }

    console.log('\n--- Super Admins ---');
    try {
        const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' },
            select: { id: true, email: true }
        });
        console.log(JSON.stringify(superAdmins, null, 2));
    } catch (e) {
        console.error('Error fetching super admins:', e);
    }

    console.log('\n--- Learning Areas ---');
    try {
        // @ts-ignore
        if (prisma.learningArea) {
            // @ts-ignore
            const subjects = await prisma.learningArea.findMany({
                select: { id: true, name: true }
            });
            console.log(JSON.stringify(subjects, null, 2));
        } else {
            console.log('LearningArea model not found in PrismaClient');
        }
    } catch (e) {
        console.error('Error fetching learning areas:', e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
