import prisma from './src/config/database';

async function seedBooks() {
    try {
        const school = await prisma.school.findFirst();
        if (!school) {
            console.log('No school found to seed books.');
            return;
        }

        const booksData = [
            { title: 'Mathematics Grade 1 Teacher Guide', author: 'Kenya Institute of Curriculum Development', category: 'Teacher Guide', schoolId: school.id },
            { title: 'English Literacy TextBook Grade 3', author: 'Longhorn Publishers', category: 'Textbook', schoolId: school.id },
            { title: 'Environmental Activities Pupil\'s Book Grade 2', author: 'Oxford University Press', category: 'Textbook', schoolId: school.id },
            { title: 'CRE Teacher\'s Manual Grade 4', author: 'KICD', category: 'Teacher Guide', schoolId: school.id },
            { title: 'School Laptop - Dell Latitude', author: 'Dell', category: 'Equipment', schoolId: school.id },
            { title: 'Digital Tablet - Samsung Galaxy Tab', author: 'Samsung', category: 'Equipment', schoolId: school.id },
        ];

        console.log(`Seeding ${booksData.length} books...`);
        for (const book of booksData) {
            await prisma.book.upsert({
                where: { id: `seed-${book.title.replace(/\s+/g, '-').toLowerCase()}` },
                update: {},
                create: {
                    id: `seed-${book.title.replace(/\s+/g, '-').toLowerCase()}`,
                    ...book
                }
            });
        }
        console.log('Books seeded successfully!');

    } catch (error: any) {
        console.error('Error seeding books:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedBooks();
