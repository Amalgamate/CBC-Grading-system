
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize with the specific Live DB URL
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function main() {
    const targetEmail = 'superadmin@template.test';
    const removeEmail = 'superadmin@local.test';
    const newPassword = 'ChangeMeNow123!';

    console.log(`🌍 Connecting to LIVE database...`);
    console.log(`🔐 Updating credentials for ${targetEmail}...`);

    // 1. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Check if target user exists first
    const targetUser = await prisma.user.findUnique({
        where: { email: targetEmail }
    });

    if (targetUser) {
        // Update existing
        try {
            const updatedUser = await prisma.user.update({
                where: { email: targetEmail },
                data: { password: hashedPassword }
            });
            console.log(`✅ Password updated for ${updatedUser.email}`);
        } catch (error) {
            console.error(`❌ Error updating ${targetEmail}:`, error);
        }
    } else {
        console.log(`⚠️  User ${targetEmail} not found in Live DB. Creating it...`);
        // Create if missing (fallout protection)
        try {
            const newUser = await prisma.user.create({
                data: {
                    email: targetEmail,
                    password: hashedPassword,
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'SUPER_ADMIN',
                    phone: '+254713612141',
                    status: 'ACTIVE',
                    emailVerified: true
                }
            });
            console.log(`✅ Created user ${newUser.email}`);
        } catch (error) {
            console.error(`❌ Error creating ${targetEmail}:`, error);
        }
    }

    // 3. Remove other user
    console.log(`🗑️  Removing ${removeEmail}...`);
    try {
        const userToDelete = await prisma.user.findUnique({ where: { email: removeEmail } });
        if (userToDelete) {
            await prisma.user.delete({
                where: { email: removeEmail }
            });
            console.log(`✅ Removed user ${removeEmail}`);
        } else {
            console.log(`ℹ️  User ${removeEmail} does not exist in Live DB.`);
        }
    } catch (error) {
        console.log(`⚠️  Could not remove ${removeEmail}:`, error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
