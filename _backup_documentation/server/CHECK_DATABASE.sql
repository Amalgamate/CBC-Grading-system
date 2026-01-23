-- Quick Database Check Script
-- Run this in Prisma Studio or your PostgreSQL client

-- 1. Check Schools
SELECT id, name, "registrationNo", county FROM schools;

-- 2. Check Branches
SELECT id, name, code, "schoolId" FROM branches;

-- 3. Check Users (summary)
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- 4. Check Learners (summary)
SELECT grade, status, COUNT(*) as count 
FROM learners 
GROUP BY grade, status 
ORDER BY grade, status;

-- 5. Check Classes
SELECT id, name, grade, stream, "academicYear", term 
FROM classes 
ORDER BY grade, stream;

-- 6. Check CBC Tables (new)
SELECT 
  (SELECT COUNT(*) FROM core_competencies) as core_competencies_count,
  (SELECT COUNT(*) FROM values_assessments) as values_assessments_count,
  (SELECT COUNT(*) FROM co_curricular_activities) as cocurricular_count,
  (SELECT COUNT(*) FROM termly_report_comments) as report_comments_count;

-- 7. Check Assessments
SELECT 
  (SELECT COUNT(*) FROM formative_assessments) as formative_count,
  (SELECT COUNT(*) FROM summative_tests) as tests_count,
  (SELECT COUNT(*) FROM summative_results) as results_count;
