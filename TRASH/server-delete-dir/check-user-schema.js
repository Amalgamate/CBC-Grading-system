const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check User table structure
    const userSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('User table schema:');
    userSchema.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      console.log(`  ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    
    // Check if loginAttempts and lockedUntil columns exist
    const hasLoginAttempts = userSchema.some(c => c.column_name === 'loginAttempts');
    const hasLockedUntil = userSchema.some(c => c.column_name === 'lockedUntil');
    
    console.log('\nSecurity columns:');
    console.log(`  loginAttempts: ${hasLoginAttempts ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  lockedUntil: ${hasLockedUntil ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Try to get user count
    const userCount = await prisma.user.count();
    console.log(`\nUser count: ${userCount}`);
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
