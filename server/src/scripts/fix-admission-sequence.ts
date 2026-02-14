import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAdmissionSequence(schoolId: string | null = null) {
    try {
        const whereClause = schoolId ? { id: schoolId } : {};
        const schools = await prisma.school.findMany({ where: whereClause });

        console.log(`Processing ${schools.length} schools...`);

        for (const school of schools) {
            console.log(`\n--- School: ${school.name} (${school.id}) ---`);

            const academicYear = new Date().getFullYear();
            const nextAcademicYear = academicYear + 1; // Sometimes 2026

            for (const year of [academicYear, nextAcademicYear]) {
                console.log(`Checking Academic Year: ${year}`);

                // Find existing sequence
                const existingSequence = await prisma.admissionSequence.findUnique({
                    where: {
                        schoolId_academicYear: {
                            schoolId: school.id,
                            academicYear: year,
                        },
                    },
                });

                // if (!existingSequence) {
                //   console.log(`  No sequence found, creating default...`);
                //   await prisma.admissionSequence.create({
                //     data: {
                //       schoolId: school.id,
                //       academicYear: year,
                //       currentValue: 0,
                //     },
                //   });
                // }

                // Find max admission number used
                // Since admission numbers are strings (e.g., ADM-2026-003), we must extract the sequence part.
                // Assuming format ends in -XXX or has XXX.
                const learners = await prisma.learner.findMany({
                    where: {
                        schoolId: school.id,
                        admissionNumber: {
                            contains: String(year), // Filter roughly by year
                        },
                    },
                    select: { admissionNumber: true },
                });

                if (learners.length === 0) {
                    console.log(`  No learners found for year ${year}.`);
                    continue;
                }

                let maxSeq = 0;
                const separator = school.branchSeparator || '-';
                const escapedSeparator = separator === '.' ? '\\.' : separator;

                // Try to parse each admission number
                for (const l of learners) {
                    // Rough regex to find the sequence number (last 3-4 digits usually)
                    // Adjust based on known formats.
                    // TPL-ADM-2026-002 -> 002
                    // ADM-2026-005 -> 005
                    const match = l.admissionNumber.match(/(\d+)$/);
                    if (match) {
                        const seq = parseInt(match[1], 10);
                        if (!isNaN(seq) && seq > maxSeq) {
                            maxSeq = seq;
                        }
                    }
                }

                console.log(`  Max parsed sequence from existing learners: ${maxSeq}`);

                let currentSeqVal = existingSequence ? existingSequence.currentValue : 0;
                console.log(`  Current DB sequence value: ${currentSeqVal}`);

                if (maxSeq > currentSeqVal) {
                    console.log(`  ⚠ OUT OF SYNC! Updating sequence to ${maxSeq}...`);
                    await prisma.admissionSequence.upsert({
                        where: {
                            schoolId_academicYear: {
                                schoolId: school.id,
                                academicYear: year,
                            },
                        },
                        update: {
                            currentValue: maxSeq,
                        },
                        create: {
                            schoolId: school.id,
                            academicYear: year,
                            currentValue: maxSeq,
                        },
                    });
                    console.log(`  ✅ Fixed.`);
                } else {
                    console.log(`  ✅ In sync.`);
                }
            }
        }
    } catch (error) {
        console.error('Error fixing sequences:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Check for school ID argument
const schoolIdArg = process.argv[2];
fixAdmissionSequence(schoolIdArg);
