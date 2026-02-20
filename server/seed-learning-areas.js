const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SCHOOL_ID = "4252d1b5-196e-4a4e-a99b-8613706e7f8e";

const ppAreas = [
    { name: 'Language Activities', shortName: 'LANG', icon: '📝', color: '#3b82f6' },
    { name: 'Mathematical Activities', shortName: 'MATH', icon: '🔢', color: '#10b981' },
    { name: 'Environmental Activities', shortName: 'ENV', icon: '🌍', color: '#f59e0b' },
    { name: 'Creative Activities', shortName: 'CREA', icon: '🎨', color: '#ec4899' },
    { name: 'Religious Activities', shortName: 'REL', icon: '🙏', color: '#8b5cf6' },
    { name: 'Pastoral Programme of Instruction (PPI)', shortName: 'PPI', icon: '📖', color: '#6366f1' },
];

const lowerPrimaryAreas = [
    { name: 'English', shortName: 'ENG', icon: '🅰️', color: '#3b82f6' },
    { name: 'Kiswahili', shortName: 'KISW', icon: '🇰🇪', color: '#ef4444' },
    { name: 'Indigenous Language / KSL', shortName: 'INDIG', icon: '🗣️', color: '#f59e0b' },
    { name: 'Mathematics', shortName: 'MATH', icon: '🔢', color: '#10b981' },
    { name: 'Environmental Activities', shortName: 'ENV', icon: '🌍', color: '#10b981' },
    { name: 'Creative Activities', shortName: 'CREA', icon: '🎨', color: '#ec4899' },
    { name: 'Religious Education', shortName: 'REL', icon: '⛪', color: '#8b5cf6' },
];

const upperPrimaryAreas = [
    { name: 'Mathematics', shortName: 'MATH', icon: '🔢', color: '#10b981' },
    { name: 'English', shortName: 'ENG', icon: '🅰️', color: '#3b82f6' },
    { name: 'Kiswahili', shortName: 'KISW', icon: '🇰🇪', color: '#ef4444' },
    { name: 'Indigenous Language / KSL', shortName: 'INDIG', icon: '🗣️', color: '#f59e0b' },
    { name: 'Science and Technology', shortName: 'SCI', icon: '🔬', color: '#06b6d4' },
    { name: 'Social Studies', shortName: 'SOC', icon: '🗺️', color: '#f97316' },
    { name: 'Agriculture & Nutrition', shortName: 'AGRI', icon: '🌱', color: '#84cc16' },
    { name: 'Creative Arts', shortName: 'CREA', icon: '🖼️', color: '#f43f5e' },
    { name: 'Religious Education', shortName: 'REL', icon: '⛪', color: '#8b5cf6' },
];

const juniorSchoolAreas = [
    { name: 'English', shortName: 'ENG', icon: '🅰️', color: '#3b82f6' },
    { name: 'Kiswahili', shortName: 'KISW', icon: '🇰🇪', color: '#ef4444' },
    { name: 'Mathematics', shortName: 'MATH', icon: '🔢', color: '#10b981' },
    { name: 'Integrated Science', shortName: 'SCI', icon: '🧪', color: '#06b6d4' },
    { name: 'Social Studies', shortName: 'SOC', icon: '⚖️', color: '#f97316' },
    { name: 'Religious Education', shortName: 'REL', icon: '⛪', color: '#8b5cf6' },
    { name: 'Pre-Technical Studies', shortName: 'PRE-TECH', icon: '🛠️', color: '#64748b' },
    { name: 'Agriculture', shortName: 'AGRI', icon: '🌾', color: '#84cc16' },
    { name: 'Creative Arts & Sports', shortName: 'SPORT', icon: '⚽', color: '#ec4899' },
];

const grades = [
    { label: 'PP1', areas: ppAreas },
    { label: 'PP2', areas: ppAreas },
    { label: 'GRADE_1', areas: lowerPrimaryAreas },
    { label: 'GRADE_2', areas: lowerPrimaryAreas },
    { label: 'GRADE_3', areas: lowerPrimaryAreas },
    { label: 'GRADE_4', areas: upperPrimaryAreas },
    { label: 'GRADE_5', areas: upperPrimaryAreas },
    { label: 'GRADE_6', areas: upperPrimaryAreas },
    { label: 'GRADE_7', areas: juniorSchoolAreas },
    { label: 'GRADE_8', areas: juniorSchoolAreas },
    { label: 'GRADE_9', areas: juniorSchoolAreas },
];

async function seed() {
    console.log('🚀 Seeding Learning Areas for each grade (using Enum codes)...');

    await prisma.learningArea.deleteMany({
        where: { schoolId: SCHOOL_ID }
    });

    for (const grade of grades) {
        console.log(`Processing ${grade.label}...`);
        for (const area of grade.areas) {
            try {
                await prisma.learningArea.create({
                    data: {
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

    console.log('✅ Seeding complete!');
}

seed()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
