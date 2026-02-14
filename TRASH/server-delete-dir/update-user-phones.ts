import prisma from '../src/config/database';

async function updateUserPhones() {
  try {
    const result = await prisma.user.updateMany({
      data: {
        phone: '+254713612141'
      }
    });
    
    console.log(`✅ Updated ${result.count} users with phone: +254713612141`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
}

updateUserPhones();
