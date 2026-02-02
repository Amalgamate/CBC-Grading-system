import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePhone() {
    console.log('🔄 Updating Super Admin phone number...');
    try {
        const user = await prisma.user.update({
            where: { email: 'superadmin@local.test' },
            data: { phone: '+254713612141' }
        });
        console.log(`✅ Successfully updated ${user.email} with new phone: ${user.phone}`);
    } catch (error) {
        console.error('❌ Failed to update phone number:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePhone();
