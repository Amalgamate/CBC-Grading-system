import prisma from './src/config/database';

async function checkAdminOTP() {
    try {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@local.test' },
            select: {
                email: true,
                phone: true,
                phoneVerificationCode: true,
                phoneVerificationSentAt: true
            }
        });

        console.log('\n=== Admin User OTP Info ===');
        console.log('Email:', admin?.email);
        console.log('Phone:', admin?.phone || 'NOT SET');
        console.log('OTP Code:', admin?.phoneVerificationCode || 'NOT GENERATED');
        console.log('Sent At:', admin?.phoneVerificationSentAt || 'N/A');
        console.log('===========================\n');

        if (!admin?.phone) {
            console.log('⚠️  WARNING: Admin user has no phone number!');
            console.log('💡 SOLUTION: Use "Login as Super Admin" button instead\n');
        } else if (admin?.phoneVerificationCode) {
            console.log(`✅ USE THIS OTP: ${admin.phoneVerificationCode}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdminOTP();
