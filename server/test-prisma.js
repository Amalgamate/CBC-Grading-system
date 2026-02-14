const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client models...');
    console.log('FeeStructure:', !!prisma.feeStructure);
    console.log('FeeStructureItem:', !!prisma.feeStructureItem);

    // Check if we can query strictly
    try {
        if (prisma.feeStructureItem) {
            const count = await prisma.feeStructureItem.count();
            console.log('FeeStructureItem count:', count);
        } else {
            console.log('FeeStructureItem model is undefined on prisma client instance');
        }
    } catch (e) {
        console.log('Error accessing FeeStructureItem:', e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
