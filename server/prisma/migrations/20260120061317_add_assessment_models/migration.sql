-- CreateEnum
CREATE TYPE "RubricRating" AS ENUM ('EE', 'ME', 'AE', 'BE');

-- CreateEnum
CREATE TYPE "SummativeGrade" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "formative_assessments" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL DEFAULT 'TERM_1',
    "academicYear" INTEGER NOT NULL DEFAULT 2026,
    "learningArea" TEXT NOT NULL,
    "strand" TEXT,
    "subStrand" TEXT,
    "overallRating" "RubricRating" NOT NULL,
    "exceedingCount" INTEGER NOT NULL DEFAULT 0,
    "meetingCount" INTEGER NOT NULL DEFAULT 0,
    "approachingCount" INTEGER NOT NULL DEFAULT 0,
    "belowCount" INTEGER NOT NULL DEFAULT 0,
    "strengths" TEXT,
    "areasImprovement" TEXT,
    "remarks" TEXT,
    "recommendations" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formative_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summative_tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "learningArea" TEXT NOT NULL,
    "term" "Term" NOT NULL DEFAULT 'TERM_1',
    "academicYear" INTEGER NOT NULL DEFAULT 2026,
    "grade" "Grade" NOT NULL,
    "testDate" DATE NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "passMarks" INTEGER NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "instructions" TEXT,
    "createdBy" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summative_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summative_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "marksObtained" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "grade" "SummativeGrade" NOT NULL,
    "status" "TestStatus" NOT NULL,
    "position" INTEGER,
    "outOf" INTEGER,
    "remarks" TEXT,
    "teacherComment" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summative_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "formative_assessments_learnerId_idx" ON "formative_assessments"("learnerId");

-- CreateIndex
CREATE INDEX "formative_assessments_teacherId_idx" ON "formative_assessments"("teacherId");

-- CreateIndex
CREATE INDEX "formative_assessments_term_academicYear_idx" ON "formative_assessments"("term", "academicYear");

-- CreateIndex
CREATE INDEX "formative_assessments_learningArea_idx" ON "formative_assessments"("learningArea");

-- CreateIndex
CREATE UNIQUE INDEX "formative_assessments_learnerId_term_academicYear_learningA_key" ON "formative_assessments"("learnerId", "term", "academicYear", "learningArea");

-- CreateIndex
CREATE INDEX "summative_tests_grade_term_academicYear_idx" ON "summative_tests"("grade", "term", "academicYear");

-- CreateIndex
CREATE INDEX "summative_tests_learningArea_idx" ON "summative_tests"("learningArea");

-- CreateIndex
CREATE INDEX "summative_tests_createdBy_idx" ON "summative_tests"("createdBy");

-- CreateIndex
CREATE INDEX "summative_tests_testDate_idx" ON "summative_tests"("testDate");

-- CreateIndex
CREATE INDEX "summative_results_testId_idx" ON "summative_results"("testId");

-- CreateIndex
CREATE INDEX "summative_results_learnerId_idx" ON "summative_results"("learnerId");

-- CreateIndex
CREATE INDEX "summative_results_grade_idx" ON "summative_results"("grade");

-- CreateIndex
CREATE INDEX "summative_results_status_idx" ON "summative_results"("status");

-- CreateIndex
CREATE UNIQUE INDEX "summative_results_testId_learnerId_key" ON "summative_results"("testId", "learnerId");

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "summative_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
