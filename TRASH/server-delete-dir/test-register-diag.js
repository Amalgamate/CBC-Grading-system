const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function testRegister() {
    console.log('--- Testing Registration ---');
    const testEmail = `test-${Date.now()}@example.com`;
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                role: 'PARENT',
                status: 'ACTIVE'
            }
        });
        console.log('✅ Successfully registered:', user.email);

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Successfully cleaned up test user');
    } catch (err) {
        console.error('❌ Registration failed:');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

testRegister();
