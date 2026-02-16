const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Simple CSV parsing - handle quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      const nextChar = lines[i][j + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim().replace(/^"|"$/g, ''));

    const record = {};
    headers.forEach((header, index) => {
      record[header] = fields[index] || '';
    });
    records.push(record);
  }

  return records;
}

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

function findBestNameMatch(providedName, databaseNames) {
  const normalized = providedName.toLowerCase().trim();
  
  let bestMatch = null;
  let bestScore = Infinity;

  databaseNames.forEach(item => {
    const dbName = item.name.toLowerCase().trim();
    const score = levenshteinDistance(normalized, dbName);
    
    if (score < bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  return bestScore <= 5 ? { match: bestMatch, score: bestScore } : null;
}

async function matchGrade4StudentsToDatabase() {
  try {
    console.log('\n' + '═'.repeat(130));
    console.log('📚 MATCHING GRADE 4 STUDENTS FROM DATABASE');
    console.log('═'.repeat(130) + '\n');

    // Read Students Database CSV
    const csvPath = path.join(__dirname, '../templates/Students Database.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Students Database not found at ${csvPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSV(fileContent);

    console.log(`✅ Loaded Students Database with ${records.length} total records\n`);

    // Filter for Grade 4 students
    const grade4FromDB = records.filter(r => {
      const classValue = String(r.Class).trim().toLowerCase();
      return classValue === '4' || classValue === 'grade 4' || classValue === 'class 4';
    });

    console.log(`✅ Found ${grade4FromDB.length} Grade 4 students in database\n`);

    if (grade4FromDB.length === 0) {
      console.error('⚠️ No Grade 4 students found in database');
      await prisma.$disconnect();
      return;
    }

    // Get school
    const school = await prisma.school.findUnique({
      where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
      console.error('❌ School not found');
      process.exit(1);
    }

    // Get all Grade 4 learners from our database
    const grade4Learners = await prisma.learner.findMany({
      where: {
        schoolId: school.id,
        grade: 'GRADE_4'
      }
    });

    console.log(`✅ Found ${grade4Learners.length} Grade 4 learners in system\n`);

    // Convert to matchable format
    const dbStudents = grade4FromDB.map(r => ({
      name: r['Leaner Name'] || r['Learner Name'] || r['Student Name'] || '',
      admissionNo: r['Adm No'] || r['Admission No'] || '',
      parentGuardian: r['Parent/Guardian'] || r['Parent'] || r['Guardian'] || '',
      phone1: r['Phone 1'] || r['Phone 1'] || '',
      phone2: r['Phone 2'] || r['Phone 2'] || '',
      original: r
    }));

    console.log('─'.repeat(130));
    console.log('MATCHING RESULTS:');
    console.log('─'.repeat(130) + '\n');

    let matchCount = 0;
    let noMatchCount = 0;
    const results = [];

    // Try to match each learner in our system with database record
    for (const learner of grade4Learners) {
      const learnerFullName = `${learner.firstName} ${learner.lastName}`.trim();
      const matchResult = findBestNameMatch(learnerFullName, dbStudents);

      if (matchResult) {
        const dbStudent = matchResult.match;
        try {
          // Parse parent/guardian name
          const parentName = dbStudent.parentGuardian;
          let guardianName = parentName;
          let guardianPhone = dbStudent.phone1;

          // Update learner with guardian information
          await prisma.learner.update({
            where: { id: learner.id },
            data: {
              guardianName: guardianName,
              guardianPhone: guardianPhone,
              admissionNumber: dbStudent.admissionNo || learner.admissionNumber
            }
          });

          matchCount++;
          results.push({
            learner: learnerFullName,
            dbStudent: dbStudent.name,
            guardian: guardianName,
            phone: guardianPhone,
            similarity: matchResult.score,
            status: '✅ MATCHED'
          });

          console.log(`✅ ${learnerFullName}`);
          console.log(`   → Database: ${dbStudent.name} | Guardian: ${guardianName} | Phone: ${guardianPhone}\n`);
        } catch (error) {
          console.error(`❌ Error updating learner ${learnerFullName}: ${error.message}\n`);
          noMatchCount++;
        }
      } else {
        noMatchCount++;
        results.push({
          learner: learnerFullName,
          dbStudent: 'No match',
          guardian: 'N/A',
          phone: 'N/A',
          similarity: 'N/A',
          status: '⚠️ NOT MATCHED'
        });

        console.log(`⚠️ ${learnerFullName} - No suitable match in database\n`);
      }
    }

    console.log('═'.repeat(130));
    console.log('📊 MATCHING SUMMARY:');
    console.log('─'.repeat(130));
    console.log(`✅ Successfully matched: ${matchCount}/${grade4Learners.length}`);
    console.log(`⚠️ Not matched: ${noMatchCount}/${grade4Learners.length}`);
    console.log(`📈 Match rate: ${((matchCount / grade4Learners.length) * 100).toFixed(1)}%`);
    console.log('═'.repeat(130) + '\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

matchGrade4StudentsToDatabase();
