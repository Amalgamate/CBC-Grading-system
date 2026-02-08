
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    const targetEmails = ['amalgamateimages@gmail.com', 'karistosh@gmail.com']; // Guessed Karistosh email, will also search by school name
    const targetSchoolNames = ['Amalgamate', 'Karistosh']; // Partial match

    console.log('🧹 Starting cleanup...');

    try {
        // 1. Find Users by email or name
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { in: targetEmails } },
                    { firstName: { contains: 'Karistosh', mode: 'insensitive' } },
                    { lastName: { contains: 'Karistosh', mode: 'insensitive' } },
                    { firstName: { contains: 'Amalgamate', mode: 'insensitive' } }
                ]
            },
            include: { school: true }
        });

        console.log(`Found ${users.length} users to clean up.`);

        const schoolIdsToDelete = new Set<string>();
        const userIdsToDelete = new Set<string>();

        for (const user of users) {
            console.log(`- User: ${user.email} (${user.firstName} ${user.lastName})`);
            userIdsToDelete.add(user.id);
            if (user.schoolId) {
                schoolIdsToDelete.add(user.schoolId);
            }
        }

        // 2. Find Schools by name (in case user creation failed but school exists)
        const schools = await prisma.school.findMany({
            where: {
                OR: [
                    { name: { contains: 'Amalgamate', mode: 'insensitive' } },
                    { name: { contains: 'Karistosh', mode: 'insensitive' } }
                ]
            }
        });

        console.log(`Found ${schools.length} schools matching name pattern.`);

        for (const school of schools) {
            console.log(`- School: ${school.name} (${school.id})`);
            schoolIdsToDelete.add(school.id);
        }

        if (schoolIdsToDelete.size === 0 && userIdsToDelete.size === 0) {
            console.log('No data found to delete.');
            return;
        }

        console.log(`\n🚨 DELETING ${schoolIdsToDelete.size} schools and ${userIdsToDelete.size} users...`);

        // 3. Delete Data
        // We delete schools first. Prisma Cascade should handle branches, learners, etc.
        // However, Users created might be linked. 
        // Schema says: School -> User (SchoolUsers) is SetNull usually, but let's check.
        // We want to delete the users too.

        await prisma.$transaction(async (tx) => {
            // Delete Users first to avoid foreign key constraints if they are admins?
            // Actually, if we delete School, and User points to School, it might SetNull.
            // Let's delete schools first, then users.

            const schools = Array.from(schoolIdsToDelete);
            if (schools.length > 0) {
                // Delete dependencies manually if needed, but schema says Cascade for Branch, Learner.
                // What about 'users' relation in school? 
                // User -> School is onDelete: SetNull.
                // So deleting school will just set user.schoolId = null. 
                // We must manually delete the users.

                const deletedSchools = await tx.school.deleteMany({
                    where: { id: { in: schools } }
                });
                console.log(`✅ Deleted ${deletedSchools.count} schools.`);
            }

            const users = Array.from(userIdsToDelete);
            if (users.length > 0) {
                const deletedUsers = await tx.user.deleteMany({
                    where: { id: { in: users } }
                });
                console.log(`✅ Deleted ${deletedUsers.count} users.`);
            }
        });

        console.log('🎉 Cleanup complete!');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
