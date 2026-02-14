const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name;
    `;
    
    console.log('Tables in production database:');
    result.forEach(row => console.log('  -', row.table_name));
    
    if (result.length === 0) {
      console.log('\n⚠️  NO TABLES FOUND - Database is empty!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
