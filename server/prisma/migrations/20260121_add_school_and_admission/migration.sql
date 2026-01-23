-- ============================================
-- COMPLETE MIGRATION: SCHOOLS, BRANCHES & ADMISSION
-- ============================================

-- CreateEnum AdmissionFormatType
CREATE TYPE "AdmissionFormatType" AS ENUM ('NO_BRANCH', 'BRANCH_PREFIX_START', 'BRANCH_PREFIX_MIDDLE', 'BRANCH_PREFIX_END');

-- CreateTable schools
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNo" TEXT,
    "address" TEXT,
    "county" TEXT,
    "subCounty" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "principalName" TEXT,
    "principalPhone" TEXT,
    "logoUrl" TEXT,
    "admissionFormatType" "AdmissionFormatType" NOT NULL DEFAULT 'BRANCH_PREFIX_START',
    "branchSeparator" TEXT NOT NULL DEFAULT '-',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable admission_sequences
CREATE TABLE "admission_sequences" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable branches
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "principalName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- AlterTable learners - Add schoolId and branchId
ALTER TABLE "learners" ADD COLUMN "schoolId" TEXT;
ALTER TABLE "learners" ADD COLUMN "branchId" TEXT;

-- AlterTable classes - Add branchId
ALTER TABLE "classes" ADD COLUMN "branchId" TEXT;

-- Create indexes for schools table
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");
CREATE UNIQUE INDEX "schools_registrationNo_key" ON "schools"("registrationNo");
CREATE INDEX "schools_county_idx" ON "schools"("county");

-- Create indexes for admission_sequences table
CREATE UNIQUE INDEX "admission_sequences_schoolId_academicYear_key" ON "admission_sequences"("schoolId", "academicYear");
CREATE INDEX "admission_sequences_schoolId_idx" ON "admission_sequences"("schoolId");
CREATE INDEX "admission_sequences_academicYear_idx" ON "admission_sequences"("academicYear");

-- Create indexes for branches table
CREATE UNIQUE INDEX "branches_schoolId_code_key" ON "branches"("schoolId", "code");
CREATE INDEX "branches_schoolId_idx" ON "branches"("schoolId");
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- Create indexes for learners
CREATE INDEX "learners_schoolId_idx" ON "learners"("schoolId");
CREATE INDEX "learners_branchId_idx" ON "learners"("branchId");

-- Create indexes for classes
CREATE INDEX "classes_branchId_idx" ON "classes"("branchId");

-- ============================================
-- DATA MIGRATION
-- ============================================

-- Step 1: Create a default school for existing learners
INSERT INTO "schools" (id, name, "registrationNo", "createdAt", "updatedAt")
VALUES (
    'default-school-' || substr(md5(random()::text), 1, 8),
    'Default School',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Create default branch (HQ) for the default school
INSERT INTO "branches" (id, "schoolId", name, code, "active", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'Headquarters',
  'HQ',
  active,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "schools"
WHERE "name" = 'Default School';

-- Step 3: Assign all existing learners to default school and default branch
UPDATE "learners" l
SET 
  "schoolId" = (SELECT "id" FROM "schools" WHERE "name" = 'Default School' LIMIT 1),
  "branchId" = (SELECT b.id FROM "branches" b WHERE b.code = 'HQ' AND b."schoolId" = (SELECT "id" FROM "schools" WHERE "name" = 'Default School' LIMIT 1) LIMIT 1)
WHERE l."schoolId" IS NULL;

-- Step 4: Assign all existing classes to default branch
UPDATE "classes" c
SET "branchId" = (
  SELECT b.id FROM "branches" b WHERE b.code = 'HQ' LIMIT 1
)
WHERE c."branchId" IS NULL;

-- Step 5: Make schoolId and branchId NOT NULL
ALTER TABLE "learners" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "learners" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "classes" ALTER COLUMN "branchId" SET NOT NULL;

-- Step 6: Drop the old global unique constraint on admissionNumber
ALTER TABLE "learners" DROP CONSTRAINT IF EXISTS "learners_admissionNumber_key";

-- Step 7: Add new scoped unique constraint on (schoolId, admissionNumber)
ALTER TABLE "learners" ADD CONSTRAINT "learners_schoolId_admissionNumber_key" UNIQUE ("schoolId", "admissionNumber");

-- Step 8: Add foreign key constraints
ALTER TABLE "learners" ADD CONSTRAINT "learners_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE;
ALTER TABLE "learners" ADD CONSTRAINT "learners_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "admission_sequences" ADD CONSTRAINT "admission_sequences_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE;
ALTER TABLE "branches" ADD CONSTRAINT "branches_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE;

-- Step 9: Update the class unique constraint to include branchId
ALTER TABLE "classes" DROP CONSTRAINT IF EXISTS "classes_grade_stream_academicYear_term_key";
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_grade_stream_academicYear_term_key" UNIQUE ("branchId", "grade", "stream", "academicYear", "term");
