const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SCHOOL_ID = "4252d1b5-196e-4a4e-a99b-8613706e7f8e";

const crecheAreas = [
    { name: 'Social Interaction', shortName: 'SOC', icon: '🤝', color: '#ec4899' },
    { name: 'Play-based Learning', shortName: 'PLAY', icon: '🧸', color: '#8b5cf6' },
    { name: 'Motor Skills', shortName: 'MTR', icon: '🏃', color: '#10b981' },
    { name: 'Language Exposure', shortName: 'LANG', icon: '👂', color: '#3b82f6' },
    { name: 'Emotional Development', shortName: 'EMO', icon: '❤️', color: '#f43f5e' },
];

const playgroupAreas = [
    { name: 'Language Development', shortName: 'LANG', icon: '🗣️', color: '#3b82f6' },
    { name: 'Number Concepts', shortName: 'NUM', icon: '🔢', color: '#10b981' },
    { name: 'Creative Play', shortName: 'CREA', icon: '🎨', color: '#ec4899' },
    { name: 'Environmental Awareness', shortName: 'ENV', icon: '🌍', color: '#f59e0b' },
    { name: 'Psychomotor Activities', shortName: 'PSYCH', icon: '🤸', color: '#8b5cf6' },
];

const receptionAreas = [
    { name: 'Language Activities', shortName: 'LANG', icon: '📝', color: '#3b82f6' },
    { name: 'Mathematical Activities', shortName: 'MATH', icon: '🔢', color: '#10b981' },
    { name: 'Creative Activities', shortName: 'CREA', icon: '🎨', color: '#ec4899' },
    { name: 'Environmental Activities', shortName: 'ENV', icon: '🌍', color: '#f59e0b' },
    { name: 'Religious Activities', shortName: 'REL', icon: '🙏', color: '#8b5cf6' },
];

const grades = [
    { label: 'CRECHE', areas: crecheAreas },
    { label: 'PLAYGROUP', areas: playgroupAreas },
    { label: 'RECEPTION', areas: receptionAreas },
];

async function seed() {
    console.log('🚀 Seeding Early Childhood Learning Areas...');

    for (const grade of grades) {
        console.log(`Processing ${grade.label}...`);
        for (const area of grade.areas) {
            try {
                await prisma.learningArea.upsert({
                    where: {
                        schoolId_name_gradeLevel: {
                            schoolId: SCHOOL_ID,
                            name: area.name,
                            gradeLevel: grade.label
                        }
                    },
                    update: area,
                    create: {
                        ...area,
                        gradeLevel: grade.label,
                        schoolId: SCHOOL_ID
                    }
                });
            } catch (err) {
                console.error(`Failed to seed ${area.name} for ${grade.label}:`, err.message);
            }
        }
    }

    console.log('✅ Early Years seeding complete!');
}

seed()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
