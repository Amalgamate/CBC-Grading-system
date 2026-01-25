-- ============================================
-- SEED STREAMS A-D
-- Quick SQL script to add streams to all schools
-- ============================================

-- Step 1: Check current streams
-- ============================================
SELECT 
  s.name AS school_name,
  sc.name AS stream_name,
  sc.active
FROM stream_configs sc
JOIN schools s ON s.id = sc."schoolId"
ORDER BY s.name, sc.name;


-- Step 2: See which streams are missing
-- ============================================
WITH required_streams AS (
  SELECT unnest(ARRAY['A', 'B', 'C', 'D']) AS stream_name
),
schools_with_required_streams AS (
  SELECT 
    s.id AS school_id,
    s.name AS school_name,
    rs.stream_name
  FROM schools s
  CROSS JOIN required_streams rs
  WHERE s.active = true
)
SELECT 
  srs.school_name,
  srs.stream_name,
  CASE 
    WHEN sc.id IS NULL THEN '❌ Missing'
    ELSE '✅ Exists'
  END AS status
FROM schools_with_required_streams srs
LEFT JOIN stream_configs sc ON sc."schoolId" = srs.school_id AND sc.name = srs.stream_name
ORDER BY srs.school_name, srs.stream_name;


-- Step 3: CREATE STREAMS A-D FOR ALL ACTIVE SCHOOLS
-- ============================================
-- WARNING: This will create streams for ALL active schools
-- Comment out if you only want to see what would be created

INSERT INTO stream_configs (id, "schoolId", name, active, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid() AS id,
  s.id AS "schoolId",
  stream_name AS name,
  true AS active,
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['A', 'B', 'C', 'D']) AS stream_name
) streams
WHERE s.active = true
  AND NOT EXISTS (
    -- Don't create if stream already exists (case-insensitive)
    SELECT 1 FROM stream_configs sc 
    WHERE sc."schoolId" = s.id 
    AND LOWER(sc.name) = LOWER(streams.stream_name)
  )
ORDER BY s.name, streams.stream_name;


-- Step 4: Verify creation
-- ============================================
SELECT 
  s.name AS school_name,
  s.id AS school_id,
  COUNT(sc.id) AS total_streams,
  STRING_AGG(sc.name, ', ' ORDER BY sc.name) AS streams
FROM schools s
LEFT JOIN stream_configs sc ON sc."schoolId" = s.id
WHERE s.active = true
GROUP BY s.id, s.name
ORDER BY s.name;


-- Step 5: Show detailed list
-- ============================================
SELECT 
  s.name AS school_name,
  sc.name AS stream_name,
  sc.active,
  sc."createdAt",
  sc.id AS stream_id
FROM stream_configs sc
JOIN schools s ON s.id = sc."schoolId"
ORDER BY s.name, sc.name;


-- ============================================
-- ALTERNATIVE: Create streams for ONE school only
-- ============================================
-- If you only want to add streams to a specific school,
-- uncomment and use this instead:

/*
-- First, find your school ID
SELECT id, name FROM schools WHERE active = true;

-- Then insert streams for that specific school
-- REPLACE 'YOUR_SCHOOL_ID_HERE' with actual school ID
INSERT INTO stream_configs (id, "schoolId", name, active, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'YOUR_SCHOOL_ID_HERE',
  stream_name,
  true,
  NOW(),
  NOW()
FROM (
  SELECT unnest(ARRAY['A', 'B', 'C', 'D']) AS stream_name
) streams
WHERE NOT EXISTS (
  SELECT 1 FROM stream_configs 
  WHERE "schoolId" = 'YOUR_SCHOOL_ID_HERE'
  AND LOWER(name) = LOWER(streams.stream_name)
);
*/


-- ============================================
-- CLEANUP: Remove all streams (if needed)
-- ============================================
-- CAUTION: This will delete ALL streams
-- Only use if you need to start fresh

/*
DELETE FROM stream_configs;
*/


-- ============================================
-- CUSTOM: Add specific streams
-- ============================================
-- If you want streams other than A-D, modify this:

/*
INSERT INTO stream_configs (id, "schoolId", name, active, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  s.id,
  stream_name,
  true,
  NOW(),
  NOW()
FROM schools s
CROSS JOIN (
  -- Customize your stream names here
  SELECT unnest(ARRAY['North', 'South', 'East', 'West']) AS stream_name
  -- OR
  -- SELECT unnest(ARRAY['Red', 'Blue', 'Green', 'Yellow']) AS stream_name
  -- OR
  -- SELECT unnest(ARRAY['Alpha', 'Beta', 'Gamma', 'Delta']) AS stream_name
) streams
WHERE s.active = true
  AND NOT EXISTS (
    SELECT 1 FROM stream_configs sc 
    WHERE sc."schoolId" = s.id 
    AND LOWER(sc.name) = LOWER(streams.stream_name)
  );
*/


-- ============================================
-- UTILITY: Update stream status
-- ============================================
-- To activate/deactivate specific streams:

/*
-- Deactivate stream A for all schools
UPDATE stream_configs 
SET active = false, "updatedAt" = NOW()
WHERE name = 'A';

-- Activate stream A for all schools
UPDATE stream_configs 
SET active = true, "updatedAt" = NOW()
WHERE name = 'A';

-- Deactivate stream for specific school
UPDATE stream_configs 
SET active = false, "updatedAt" = NOW()
WHERE name = 'A' AND "schoolId" = 'YOUR_SCHOOL_ID_HERE';
*/


-- ============================================
-- EXPECTED RESULTS
-- ============================================
/*
After running Step 3, you should see:
- 4 streams (A, B, C, D) for each active school
- All streams marked as active = true
- Timestamps for createdAt and updatedAt

Step 4 should show something like:
┌──────────────────┬─────────────┬──────────────┬────────────┐
│  school_name     │  school_id  │ total_streams│  streams   │
├──────────────────┼─────────────┼──────────────┼────────────┤
│ Zawadi JRN       │ uuid-here   │      4       │ A, B, C, D │
└──────────────────┴─────────────┴──────────────┴────────────┘
*/
