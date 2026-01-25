-- ============================================
-- STREAM CREATION DIAGNOSTIC SQL SCRIPT
-- Run these queries to diagnose database issues
-- ============================================

-- Step 1: Check if stream_configs table exists
-- ============================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'stream_configs'
) AS table_exists;

-- Expected: table_exists = true


-- Step 2: Check table structure
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'stream_configs'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid)
-- schoolId (text/varchar)
-- name (text/varchar)
-- active (boolean)
-- createdAt (timestamp)
-- updatedAt (timestamp)


-- Step 3: Check constraints
-- ============================================
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    ELSE con.contype::text
  END AS constraint_type_desc
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'stream_configs';

-- Expected:
-- PRIMARY KEY on id
-- UNIQUE on (schoolId, name)
-- FOREIGN KEY to schools(id)


-- Step 4: Check existing streams
-- ============================================
SELECT 
  sc.id,
  sc."schoolId",
  s.name AS school_name,
  sc.name AS stream_name,
  sc.active,
  sc."createdAt",
  sc."updatedAt"
FROM stream_configs sc
LEFT JOIN schools s ON s.id = sc."schoolId"
ORDER BY sc."createdAt" DESC;

-- This shows all existing streams


-- Step 5: Check for orphaned streams (no school)
-- ============================================
SELECT 
  sc.id,
  sc."schoolId",
  sc.name AS stream_name,
  sc.active
FROM stream_configs sc
LEFT JOIN schools s ON s.id = sc."schoolId"
WHERE s.id IS NULL;

-- Expected: No rows (all streams should have valid school)


-- Step 6: Count streams per school
-- ============================================
SELECT 
  s.id AS school_id,
  s.name AS school_name,
  COUNT(sc.id) AS stream_count
FROM schools s
LEFT JOIN stream_configs sc ON sc."schoolId" = s.id
GROUP BY s.id, s.name
ORDER BY stream_count DESC;

-- Shows how many streams each school has


-- Step 7: Check for duplicate stream names
-- ============================================
SELECT 
  "schoolId",
  name,
  COUNT(*) as count
FROM stream_configs
GROUP BY "schoolId", name
HAVING COUNT(*) > 1;

-- Expected: No rows (unique constraint should prevent this)


-- Step 8: Get all schools (for reference)
-- ============================================
SELECT 
  id,
  name,
  "registrationNo",
  active
FROM schools
ORDER BY name;

-- Lists all schools


-- Step 9: Check users and their schools
-- ============================================
SELECT 
  u.id,
  u."firstName",
  u."lastName",
  u.email,
  u.role,
  u."schoolId",
  s.name AS school_name
FROM users u
LEFT JOIN schools s ON s.id = u."schoolId"
WHERE u.role IN ('ADMIN', 'HEAD_TEACHER', 'SUPER_ADMIN')
ORDER BY u."lastName", u."firstName";

-- Shows admin users and their school assignments
-- Look for NULL schoolId values


-- Step 10: Find your specific user
-- ============================================
-- REPLACE 'your@email.com' with your actual email
SELECT 
  u.id,
  u."firstName",
  u."lastName",
  u.email,
  u.role,
  u."schoolId",
  s.name AS school_name,
  s.id AS school_id
FROM users u
LEFT JOIN schools s ON s.id = u."schoolId"
WHERE u.email = 'your@email.com';  -- CHANGE THIS

-- Check if schoolId is NULL


-- ============================================
-- DIAGNOSTIC FIXES
-- ============================================

-- Fix 1: Assign user to first school (if no school assigned)
-- ============================================
-- IMPORTANT: Uncomment and modify as needed
/*
UPDATE users 
SET "schoolId" = (
  SELECT id FROM schools 
  WHERE active = true 
  LIMIT 1
)
WHERE email = 'your@email.com'  -- CHANGE THIS
AND "schoolId" IS NULL;
*/


-- Fix 2: Create a test stream manually
-- ============================================
-- IMPORTANT: Uncomment and modify as needed
/*
INSERT INTO stream_configs (
  id,
  "schoolId",
  name,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'YOUR_SCHOOL_ID_HERE',  -- Get from Step 8
  'Test Stream',
  true,
  NOW(),
  NOW()
);
*/


-- Fix 3: Delete duplicate streams (if any found in Step 7)
-- ============================================
-- IMPORTANT: Only run if Step 7 found duplicates
/*
DELETE FROM stream_configs
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY "schoolId", LOWER(name) 
             ORDER BY "createdAt" DESC
           ) AS rn
    FROM stream_configs
  ) t
  WHERE rn > 1
);
*/


-- Fix 4: Recreate stream_configs table (LAST RESORT)
-- ============================================
-- ONLY USE IF TABLE IS CORRUPTED
-- THIS WILL DELETE ALL EXISTING STREAMS
/*
-- Backup first
CREATE TABLE stream_configs_backup AS 
SELECT * FROM stream_configs;

-- Drop and recreate
DROP TABLE IF EXISTS stream_configs CASCADE;

CREATE TABLE stream_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "schoolId" TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("schoolId", name)
);

CREATE INDEX idx_stream_configs_schoolId ON stream_configs("schoolId");
*/


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After making changes, verify with these:

-- Verify user has schoolId
SELECT 
  email, 
  "schoolId",
  CASE 
    WHEN "schoolId" IS NOT NULL THEN '✅ HAS SCHOOL'
    ELSE '❌ NO SCHOOL'
  END AS status
FROM users 
WHERE email = 'your@email.com';  -- CHANGE THIS


-- Verify stream table is healthy
SELECT 
  'Total Streams' AS metric,
  COUNT(*)::text AS value
FROM stream_configs
UNION ALL
SELECT 
  'Active Streams',
  COUNT(*)::text
FROM stream_configs
WHERE active = true
UNION ALL
SELECT 
  'Schools with Streams',
  COUNT(DISTINCT "schoolId")::text
FROM stream_configs;


-- Test creating a stream (dry run)
SELECT 
  'Would create stream for school: ' || s.name AS test,
  s.id AS "schoolId",
  'Test Stream X' AS name,
  true AS active
FROM schools s
WHERE s.active = true
LIMIT 1;


-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================
/*
Step 1: table_exists = true
Step 2: Should show 6 columns (id, schoolId, name, active, createdAt, updatedAt)
Step 3: Should show PRIMARY KEY, UNIQUE, FOREIGN KEY constraints
Step 4: Lists all existing streams (may be empty)
Step 5: Should be empty (no orphaned streams)
Step 6: Shows stream count per school
Step 7: Should be empty (no duplicates)
Step 8: Lists all schools
Step 9: Shows admin users with their schools
Step 10: Your user with schoolId (should NOT be NULL)

If Step 10 shows NULL schoolId → Run Fix 1
If Step 7 shows duplicates → Run Fix 3
If Step 1 shows false → Run Prisma migration
*/


-- ============================================
-- QUICK TEST: Can I insert a stream?
-- ============================================
-- This will test if everything is working
/*
BEGIN;

-- Get a valid school ID
WITH school AS (
  SELECT id FROM schools WHERE active = true LIMIT 1
)
-- Try to insert a test stream
INSERT INTO stream_configs (
  id, "schoolId", name, active, "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid(),
  school.id,
  'SQL_TEST_STREAM_' || EXTRACT(EPOCH FROM NOW())::text,
  true,
  NOW(),
  NOW()
FROM school
RETURNING *;

-- Check if it worked
SELECT * FROM stream_configs WHERE name LIKE 'SQL_TEST_STREAM%';

-- Rollback (doesn't actually save)
ROLLBACK;
*/
