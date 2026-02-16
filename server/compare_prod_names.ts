import { PrismaClient } from '@prisma/client';

const PROD_DATABASE_URL = "postgresql://neondb_owner:npg_8NWxneJvP9Gy@ep-mute-glitter-aiek3582-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PROD_DATABASE_URL,
        },
    },
});

const imageNames = [
    "ZAMZAM HASSAN", "AMINA RAMADHAN", "SHUEB ALI", "KHADIJA IQBAL", "MOHAMED IBRAHIM",
    "YAHYA ISACK", "IBRAHIM KALLA", "AISHA IBRAHIM", "AISHA HUSSEIN", "LADHAN ABDI",
    "ABUBAKAR SIRAJ", "MAHIR ABDULLAHI", "HAMDI MOHAMED", "ABDIWAHID MUHAMUD", "FARHAN ALI",
    "RAHMA ABDI", "ABDIRAHMAN IBRAHIM", "DAHABO HUSSEIN", "MUSARDH ALI", "SIHAM ABDIRIZACK",
    "MOHAMED HUSSEIN", "JAMAL ABDIKADIR", "RAYAN SHUKRI", "ABDIRIZACK IBRAHIM", "ZAKIA ALINOOR",
    "ROSE MAKENA", "HAMIDA ABDI"
];

async function main() {
    const schoolId = 'f071fa58-1731-4779-b16e-d59c720f4776';
    const learners = await prisma.learner.findMany({
        where: { schoolId, grade: 'GRADE_6' },
        select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true }
    });

    const prodStudents = learners.map(l => ({
        id: l.id,
        fullName: [l.firstName, l.middleName, l.lastName].filter(Boolean).join(' ').toUpperCase()
    }));

    console.log('--- NAME COMPARISON ---');
    const matchedProdIds = new Set();
    imageNames.forEach(imgName => {
        const match = prodStudents.find(p => p.fullName.includes(imgName) || imgName.includes(p.fullName.split(' ')[0]));
        if (match) {
            console.log(`✅ ${imgName.padEnd(20)} -> ${match.fullName}`);
            matchedProdIds.add(match.id);
        } else {
            console.log(`❌ ${imgName.padEnd(20)} -> NO MATCH`);
        }
    });

    console.log('\n--- UNMATCHED PROD STUDENTS ---');
    prodStudents.forEach(p => {
        if (!matchedProdIds.has(p.id)) {
            console.log(`${p.fullName} (ID: ${p.id})`);
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
