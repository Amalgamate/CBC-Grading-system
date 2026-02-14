import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client models...');
    console.log('FeeStructure:', !!prisma.feeStructure);
    // @ts-ignore
    console.log('FeeStructureItem:', !!prisma.feeStructureItem);

    // Check if we can query strictly
    try {
        // @ts-ignore
        const count = await prisma.feeStructureItem.count();
        console.log('FeeStructureItem count:', count);
    } catch (e) {
        console.log('Error accessing FeeStructureItem:', e.message);
    }
}

main()
    .catch((e: any) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
