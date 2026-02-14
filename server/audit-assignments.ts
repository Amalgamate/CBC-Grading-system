import prisma from './src/config/database';

async function checkTeacherAssignments() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: 'TEACHER',
                archived: false
            },
            include: {
                classesAsTeacher: {
                    select: {
                        id: true,
                        name: true,
                        grade: true
                    }
                },
                assignedBooks: true
            }
        });

        console.log(`--- Teacher Assignment Audit (${teachers.length} teachers found) ---`);
        teachers.forEach((t, i) => {
            console.log(`${i + 1}. ${t.firstName} ${t.lastName} (${t.staffId || 'No ID'})`);
            console.log(`   Classes: ${t.classesAsTeacher.length > 0 ? t.classesAsTeacher.map(c => c.name).join(', ') : 'None'}`);
            console.log(`   Books: ${t.assignedBooks.length > 0 ? t.assignedBooks.map(b => b.title).join(', ') : 'None'}`);
        });

    } catch (error: any) {
        console.error('Error auditing assignments:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTeacherAssignments();
