const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Levenshtein distance for fuzzy matching
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

function findParentMatch(learnerLastName, parents) {
  const normalized = learnerLastName.toLowerCase().trim();
  
  let bestMatch = null;
  let bestScore = Infinity;

  parents.forEach(parent => {
    const parentFullName = `${parent.firstName} ${parent.lastName}`.toLowerCase().trim();
    const score = levenshteinDistance(normalized, parentFullName);
    
    if (score < bestScore) {
      bestScore = score;
      bestMatch = parent;
    }
  });

  // Return match if it's close enough (threshold: 4)
  return bestScore <= 4 ? { parent: bestMatch, score: bestScore } : null;
}

async function matchGrade4StudentsToParents() {
  try {
    console.log('\n' + '═'.repeat(130));
    console.log('👨‍👩‍👧 MATCHING GRADE 4 STUDENTS TO PARENTS');
    console.log('═'.repeat(130) + '\n');

    // Get school
    const school = await prisma.school.findUnique({
      where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
      console.error('❌ School not found');
      process.exit(1);
    }

    // Get all Grade 4 learners
    const grade4Learners = await prisma.learner.findMany({
      where: {
        schoolId: school.id,
        grade: 'GRADE_4'
      }
    });

    console.log(`📚 Found ${grade4Learners.length} Grade 4 learners\n`);

    // Get all users that could be parents (PARENT role or those with school relationship)
    const allUsers = await prisma.user.findMany({
      where: {
        schoolId: school.id
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true
      }
    });

    // Filter to get potential parents (PARENT role or others)
    const parents = allUsers.filter(u => u.role === 'PARENT' || u.role !== 'ADMIN');

    console.log(`👥 Found ${parents.length} potential parents in system\n`);

    if (parents.length === 0) {
      console.error('⚠️ No parents found in the system to match with');
      await prisma.$disconnect();
      return;
    }

    console.log('─'.repeat(130));
    console.log('MATCHING RESULTS:');
    console.log('─'.repeat(130) + '\n');

    let matchCount = 0;
    let noMatchCount = 0;
    const results = [];

    // Try to match each learner to a parent
    for (const learner of grade4Learners) {
      const match = findParentMatch(learner.lastName, parents);

      if (match) {
        // Update learner with parent ID
        try {
          await prisma.learner.update({
            where: { id: learner.id },
            data: { parentId: match.parent.id }
          });

          matchCount++;
          results.push({
            learner: `${learner.firstName} ${learner.lastName}`,
            parent: `${match.parent.firstName} ${match.parent.lastName}`,
            similarity: match.score,
            status: '✅ MATCHED'
          });

          console.log(`✅ ${learner.firstName} ${learner.lastName} → ${match.parent.firstName} ${match.parent.lastName} (similarity: ${match.score})`);
        } catch (error) {
          console.error(`❌ Error updating learner ${learner.firstName}: ${error.message}`);
          noMatchCount++;
        }
      } else {
        noMatchCount++;
        results.push({
          learner: `${learner.firstName} ${learner.lastName}`,
          parent: 'No match found',
          similarity: 'N/A',
          status: '⚠️ NOT MATCHED'
        });

        console.log(`⚠️ ${learner.firstName} ${learner.lastName} - No suitable parent match found`);
      }
    }

    console.log('\n' + '═'.repeat(130));
    console.log('📊 MATCHING SUMMARY:');
    console.log('─'.repeat(130));
    console.log(`✅ Successfully matched: ${matchCount}/${grade4Learners.length}`);
    console.log(`⚠️ No match found: ${noMatchCount}/${grade4Learners.length}`);
    console.log(`📈 Match rate: ${((matchCount / grade4Learners.length) * 100).toFixed(1)}%`);
    console.log('═'.repeat(130) + '\n');

    // Show detailed results
    console.log('DETAILED RESULTS:');
    console.log('─'.repeat(130));
    results.forEach(result => {
      if (result.status === '✅ MATCHED') {
        console.log(`${result.status} | ${result.learner.padEnd(25)} → ${result.parent.padEnd(25)} (similarity score: ${result.similarity})`);
      }
    });

    console.log('\n' + '─'.repeat(130));
    console.log('UNMATCHED STUDENTS:');
    console.log('─'.repeat(130));
    results.forEach(result => {
      if (result.status === '⚠️ NOT MATCHED') {
        console.log(`${result.status} | ${result.learner}`);
      }
    });

    console.log('\n' + '═'.repeat(130) + '\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

matchGrade4StudentsToParents();
