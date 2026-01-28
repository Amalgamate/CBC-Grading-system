-- Quick SQL queries to check birthday data
-- Run these in your PostgreSQL client (pgAdmin, DBeaver, etc.)

-- 1. Check if test students exist
SELECT 
    "admissionNumber",
    "firstName",
    "lastName",
    "dateOfBirth",
    grade,
    stream,
    status,
    archived,
    "schoolId"
FROM learners
WHERE "admissionNumber" LIKE 'BDAY-TEST-%';

-- 2. Count all active learners
SELECT COUNT(*) as total_active_learners
FROM learners
WHERE status = 'ACTIVE' AND archived = false;

-- 3. Check all learners with date of birth
SELECT 
    "admissionNumber",
    "firstName" || ' ' || "lastName" as name,
    "dateOfBirth",
    DATE_PART('year', AGE("dateOfBirth")) as age,
    grade,
    status
FROM learners
WHERE "dateOfBirth" IS NOT NULL
  AND status = 'ACTIVE'
  AND archived = false
ORDER BY "dateOfBirth" DESC
LIMIT 10;

-- 4. Calculate birthdays in next 7 days (manual calculation)
WITH learner_birthdays AS (
    SELECT 
        "admissionNumber",
        "firstName",
        "lastName",
        "dateOfBirth",
        grade,
        stream,
        -- Calculate this year's birthday
        MAKE_DATE(
            EXTRACT(YEAR FROM CURRENT_DATE)::int,
            EXTRACT(MONTH FROM "dateOfBirth")::int,
            EXTRACT(DAY FROM "dateOfBirth")::int
        ) as birthday_this_year,
        -- Calculate age they're turning
        EXTRACT(YEAR FROM CURRENT_DATE)::int - EXTRACT(YEAR FROM "dateOfBirth")::int as turning_age
    FROM learners
    WHERE "dateOfBirth" IS NOT NULL
      AND status = 'ACTIVE'
      AND archived = false
)
SELECT 
    *,
    birthday_this_year - CURRENT_DATE as days_until,
    CASE 
        WHEN birthday_this_year = CURRENT_DATE THEN 'TODAY!'
        WHEN birthday_this_year > CURRENT_DATE THEN 'Upcoming'
        ELSE 'Past'
    END as status
FROM learner_birthdays
WHERE birthday_this_year BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
ORDER BY birthday_this_year;

-- 5. Check schools
SELECT id, name, active FROM schools;

-- 6. Check if learners have schoolId
SELECT 
    CASE WHEN "schoolId" IS NULL THEN 'NULL' ELSE 'HAS SCHOOL' END as school_status,
    COUNT(*) as count
FROM learners
GROUP BY school_status;
