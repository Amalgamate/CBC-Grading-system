const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    console.log('\n🔍 Checking User table...');
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User";`;
    console.log('User table exists! Count:', result[0].count);
    
    console.log('\n🔍 Checking if loginAttempts column exists...');
    try {
      const colCheck = await prisma.$queryRaw`SELECT loginAttempts FROM "User" LIMIT 1;`;
      console.log('✅ loginAttempts column exists');
    } catch (e) {
      console.log('❌ loginAttempts column MISSING:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
