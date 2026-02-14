
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNaEmail() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'N/A' }
        });

        if (user) {
            console.log('✅ FOUND User with email "N/A":', user.id);
            console.log('This confirms the hypothesis: multiple students with "N/A" parent email causes collision.');
        } else {
            console.log('❌ User with email "N/A" NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNaEmail();
