import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.learner.updateMany({
        where: {
            OR: [
                { stream: null },
                { stream: '' }
            ]
        },
        data: {
            stream: 'A'
        }
    });
    console.log(`Successfully updated ${result.count} learners to Stream A`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
