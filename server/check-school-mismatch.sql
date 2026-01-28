-- Check which school the test students belong to
SELECT 
    l."admissionNumber",
    l."firstName",
    l."lastName",
    l."schoolId",
    s.name as school_name,
    s.active as school_active
FROM learners l
LEFT JOIN schools s ON l."schoolId" = s.id
WHERE l."admissionNumber" LIKE 'BDAY-TEST-%';

-- Check which school your user belongs to
-- Replace 'your-email@example.com' with your actual login email
SELECT 
    email,
    "firstName",
    "lastName",
    role,
    "schoolId",
    s.name as school_name
FROM users u
LEFT JOIN schools s ON u."schoolId" = s.id
WHERE email = 'your-email@example.com';  -- REPLACE THIS

-- Or check all users to find yours
SELECT 
    email,
    "firstName",
    "lastName",
    role,
    "schoolId",
    s.name as school_name
FROM users u
LEFT JOIN schools s ON u."schoolId" = s.id
WHERE role IN ('ADMIN', 'SUPER_ADMIN', 'TEACHER')
ORDER BY u."createdAt" DESC
LIMIT 10;
