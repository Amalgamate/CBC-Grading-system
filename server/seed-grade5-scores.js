const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Grade 5 Scores Data from handwritten records
// Correct subject mapping:
// ENG = English, MAT = Mathematics, KISWA = Kiswahili, AGRI = Agriculture, 
// SST = Social Studies, SCI = Science, C/A = Creative Activities, RE = Religious Education
const grade5ScoresData = [
  { name: "Seraphine Kawera", scores: { ENG: 77, MAT: 96, KISWA: 86, AGRI: 77, SST: 32, SCI: 70, CA: 60, RE: 83 } },
  { name: "Reviey Abdi", scores: { ENG: 70, MAT: 82, KISWA: 82, AGRI: 82, SST: 80, SCI: 82, CA: 71, RE: 84 } },
  { name: "Habiba Said", scores: { ENG: 80, MAT: 84, KISWA: 82, AGRI: 84, SST: 80, SCI: 88, CA: 84, RE: 93 } },
  { name: "Ridhwan Adeni", scores: { ENG: 72, MAT: 78, KISWA: 26, AGRI: 76, SST: 77, SCI: 76, CA: 84, RE: 90 } },
  { name: "Ruweidha Dalry", scores: { ENG: 77, MAT: 70, KISWA: 82, AGRI: 28, SST: 73, SCI: 68, CA: 80, RE: 87 } },
  { name: "Abdi Zueick Ibrahim", scores: { ENG: 90, MAT: 92, KISWA: 70, AGRI: 84, SST: 33, SCI: 64, CA: 60, RE: 89 } },
  { name: "Shulehe Ibrahim", scores: { ENG: 60, MAT: 62, KISWA: 82, AGRI: 72, SST: 80, SCI: 80, CA: 72, RE: 76 } },
  { name: "Muud ABDI", scores: { ENG: 60, MAT: 60, KISWA: 74, AGRI: 38, SST: 73, SCI: 52, CA: 76, RE: 80 } },
  { name: "Mutolih Dahiry", scores: { ENG: 70, MAT: 68, KISWA: 68, AGRI: 34, SST: 70, SCI: 60, CA: 30, RE: 70 } },
  { name: "Fayhiya Mohamed", scores: { ENG: 67, MAT: 84, KISWA: 63, AGRI: 60, SST: 70, SCI: 63, CA: 76, RE: 85 } },
  { name: "Haneen Mohamed", scores: { ENG: 67, MAT: 72, KISWA: 70, AGRI: 70, SST: 70, SCI: 53, CA: 76, RE: 84 } },
  { name: "Somiya Shukri", scores: { ENG: 57, MAT: 26, KISWA: 54, AGRI: 60, SST: 67, SCI: 72, CA: 60, RE: 87 } },
  { name: "Ruweidhe Mohamed", scores: { ENG: 67, MAT: 66, KISWA: 72, AGRI: 77, SST: 60, SCI: 76, CA: 68, RE: 72 } },
  { name: "Abdula Abdi", scores: { ENG: 70, MAT: 58, KISWA: 60, AGRI: 34, SST: 62, SCI: 66, CA: 76, RE: 82 } },
  { name: "Ilrah Hussein", scores: { ENG: 73, MAT: 12, KISWA: 64, AGRI: 56, SST: 67, SCI: 64, CA: 30, RE: 84 } },
  { name: "Shureyim Mustafa", scores: { ENG: 63, MAT: 44, KISWA: 44, AGRI: 72, SST: 65, SCI: 60, CA: 60, RE: 80 } },
  { name: "Uthmari Hassan", scores: { ENG: 63, MAT: 56, KISWA: 62, AGRI: 80, SST: 87, SCI: 54, CA: 52, RE: 84 } },
  { name: "Yasmin Ribog", scores: { ENG: 73, MAT: 68, KISWA: 52, AGRI: 87, SST: 84, SCI: 54, CA: 32, RE: 67 } },
  { name: "Rayann Adams", scores: { ENG: 63, MAT: 74, KISWA: 70, AGRI: 62, SST: 57, SCI: 64, CA: 64, RE: 64 } },
  { name: "Tudis Nassir", scores: { ENG: 37, MAT: 72, KISWA: 56, AGRI: 56, SST: 63, SCI: 68, CA: 52, RE: 80 } },
  { name: "Siuella Bushiry", scores: { ENG: 53, MAT: 60, KISWA: 60, AGRI: 70, SST: 72, SCI: 56, CA: 60, RE: 73 } },
  { name: "Naimy Abdullahi", scores: { ENG: 63, MAT: 56, KISWA: 56, AGRI: 70, SST: 72, SCI: 52, CA: 48, RE: 73 } },
  { name: "Jally Kahya", scores: { ENG: 53, MAT: 50, KISWA: 76, AGRI: 76, SST: 57, SCI: 42, CA: 52, RE: 64 } },
  { name: "Andi Hussein", scores: { ENG: 53, MAT: 54, KISWA: 64, AGRI: 48, SST: 73, SCI: 48, CA: 44, RE: 64 } },
  { name: "Buubacide Issack", scores: { ENG: 53, MAT: 56, KISWA: 60, AGRI: 56, SST: 47, SCI: 4, CA: 60, RE: 60 } },
  { name: "Bilal Koba", scores: { ENG: 53, MAT: 50, KISWA: 52, AGRI: 72, SST: 60, SCI: 36, CA: 52, RE: 87 } },
  { name: "Mohamed Farah", scores: { ENG: 53, MAT: 54, KISWA: 32, AGRI: 12, SST: 43, SCI: 44, CA: 56, RE: 93 } },
  { name: "Suleiman Barke", scores: { ENG: 53, MAT: 46, KISWA: 42, AGRI: 62, SST: 47, SCI: 52, CA: 60, RE: 70 } },
  { name: "Seeme Abdi", scores: { ENG: 23, MAT: 50, KISWA: 42, AGRI: 12, SST: 47, SCI: 52, CA: 60, RE: 52 } },
  { name: "Hudheifa Shaban", scores: { ENG: 27, MAT: 46, KISWA: 26, AGRI: 68, SST: 63, SCI: 54, CA: 40, RE: 40 } },
  { name: "Abdi Bey Ali", scores: { ENG: 57, MAT: 10, KISWA: 46, AGRI: 80, SST: 37, SCI: 42, CA: 43, RE: 73 } },
  { name: "Amirha Guyo", scores: { ENG: 37, MAT: 24, KISWA: 46, AGRI: 28, SST: 50, SCI: 20, CA: 60, RE: 35 } }
];

// Fuzzy string matching function
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[len2][len1];
}

function findBestMatch(handwrittenName, databaseLearners) {
    const normalized1 = handwrittenName.toLowerCase().trim();
    
    let bestMatch = null;
    let bestScore = Infinity;

    databaseLearners.forEach(learner => {
        const fullName = `${learner.firstName} ${learner.lastName}`.toLowerCase().trim();
        const score = levenshteinDistance(normalized1, fullName);
        
        if (score < bestScore) {
            bestScore = score;
            bestMatch = learner;
        }
    });

    // Return match if it's reasonably close (threshold: 5)
    return bestScore <= 5 ? { learner: bestMatch, score: bestScore } : null;
}

async function main() {
    try {
        console.log('🎓 Seeding Grade 5 Scores...\n');

        // Get ZAWADI JUNIOR ACADEMY
        const school = await prisma.school.findUnique({
            where: { name: 'ZAWADI JUNIOR ACADEMY' }
        });

        if (!school) {
            console.log('❌ ZAWADI JUNIOR ACADEMY not found');
            return;
        }

        // Get all grade 5 learners
        const grade5Learners = await prisma.learner.findMany({
            where: {
                schoolId: school.id,
                grade: 'GRADE_5'
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true
            }
        });

        // Get a teacher for this school (needed to create assessments)
        const teacher = await prisma.user.findFirst({
            where: {
                schoolId: school.id,
                role: 'TEACHER'
            }
        });

        if (!teacher) {
            console.log('⚠️  No teacher found - creating assessments with placeholder');
        }

        console.log(`Found ${grade5Learners.length} Grade 5 students\n`);

        let seeded = 0;
        let unmatched = [];
        const matchedLearnerIds = new Set(); // Track already matched learners

        for (const scoreRecord of grade5ScoresData) {
            const match = findBestMatch(scoreRecord.name, grade5Learners);

            if (match && !matchedLearnerIds.has(match.learner.id)) {
                matchedLearnerIds.add(match.learner.id); // Mark as matched
                
                console.log(`✅ Matched: "${scoreRecord.name}" → ${match.learner.firstName} ${match.learner.lastName} (${match.learner.admissionNumber})`);
                
                // Create formative assessments for each subject
                const subjectsToSave = ['ENG', 'MAT', 'KISWA', 'AGRI', 'SST', 'SCI', 'CA', 'RE'];
                
                for (const subject of subjectsToSave) {
                    const score = scoreRecord.scores[subject];
                    if (score !== undefined) {
                        try {
                            await prisma.formativeAssessment.upsert({
                                where: {
                                    learnerId_term_academicYear_learningArea_type_title: {
                                        learnerId: match.learner.id,
                                        term: 'TERM_1',
                                        academicYear: 2026,
                                        learningArea: subject,
                                        type: 'OPENER',
                                        title: `Grade 5 ${subject} Score`
                                    }
                                },
                                update: {
                                    points: Math.round(score),
                                    percentage: score
                                },
                                create: {
                                    learnerId: match.learner.id,
                                    schoolId: school.id,
                                    learningArea: subject,
                                    overallRating: 'EXCEEDING',
                                    points: Math.round(score),
                                    percentage: score,
                                    teacherId: teacher?.id || school.id,
                                    term: 'TERM_1',
                                    academicYear: 2026,
                                    type: 'OPENER',
                                    title: `Grade 5 ${subject} Score`,
                                    status: 'SUBMITTED'
                                }
                            });
                        } catch (e) {
                            console.error(`  ⚠️  Could not save ${subject} for ${match.learner.firstName}: ${e.message}`);
                        }
                    }
                }
                seeded++;
            } else if (match && matchedLearnerIds.has(match.learner.id)) {
                console.log(`⚠️  Skipped duplicate: "${scoreRecord.name}" (already matched)`);
            } else {
                console.log(`❌ No match found for: ${scoreRecord.name}`);
                unmatched.push(scoreRecord.name);
            }
        }

        console.log('\n' + '─'.repeat(80));
        console.log(`✅ Successfully seeded: ${seeded} students`);
        console.log(`❌ Could not match: ${unmatched.length} students`);
        
        if (unmatched.length > 0) {
            console.log('\nUnmatched Names:');
            unmatched.forEach(name => console.log(`  - ${name}`));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
