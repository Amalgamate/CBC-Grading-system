/*
  Warnings:

  - A unique constraint covering the columns `[learnerId,term,academicYear,learningArea,type,title]` on the table `formative_assessments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FormativeAssessmentType" AS ENUM ('OPENER', 'WEEKLY', 'MONTHLY', 'CAT', 'MID_TERM', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'QUIZ', 'OTHER');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AggregationStrategy" AS ENUM ('SIMPLE_AVERAGE', 'BEST_N', 'DROP_LOWEST_N', 'WEIGHTED_AVERAGE', 'MEDIAN');

-- CreateEnum
CREATE TYPE "CurriculumType" AS ENUM ('CBC_ONLY', 'EXAM_ONLY', 'CBC_AND_EXAM', 'IGCSE', 'CAMBRIDGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('FORMATIVE_ONLY', 'SUMMATIVE_ONLY', 'MIXED');

-- DropIndex
DROP INDEX "formative_assessments_learnerId_term_academicYear_learningA_key";

-- DropIndex
DROP INDEX "summative_tests_createdBy_idx";

-- DropIndex
DROP INDEX "summative_tests_learningArea_idx";

-- DropIndex
DROP INDEX "summative_tests_testDate_idx";

-- AlterTable
ALTER TABLE "formative_assessments" ADD COLUMN     "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "maxScore" DOUBLE PRECISION,
ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" "FormativeAssessmentType" NOT NULL DEFAULT 'OPENER',
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "assessmentMode" "AssessmentMode" NOT NULL DEFAULT 'MIXED',
ADD COLUMN     "curriculumType" "CurriculumType" NOT NULL DEFAULT 'CBC_AND_EXAM',
ADD COLUMN     "customGradingScale" JSONB;

-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "curriculum" "CurriculumType" NOT NULL DEFAULT 'CBC_AND_EXAM',
ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedBy" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 100.0;

-- CreateTable
CREATE TABLE "term_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "term" "Term" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "formativeWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "summativeWeight" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "term_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregation_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" "Grade",
    "learningArea" TEXT,
    "type" "FormativeAssessmentType" NOT NULL,
    "strategy" "AggregationStrategy" NOT NULL DEFAULT 'SIMPLE_AVERAGE',
    "nValue" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_history" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "change_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "term_configs_schoolId_academicYear_term_key" ON "term_configs"("schoolId", "academicYear", "term");

-- CreateIndex
CREATE INDEX "change_history_schoolId_idx" ON "change_history"("schoolId");

-- CreateIndex
CREATE INDEX "change_history_entityType_entityId_idx" ON "change_history"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "formative_assessments_learnerId_term_academicYear_learningA_key" ON "formative_assessments"("learnerId", "term", "academicYear", "learningArea", "type", "title");

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_configs" ADD CONSTRAINT "term_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_configs" ADD CONSTRAINT "term_configs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregation_configs" ADD CONSTRAINT "aggregation_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregation_configs" ADD CONSTRAINT "aggregation_configs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
