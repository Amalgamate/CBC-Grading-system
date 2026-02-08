-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePicture" TEXT;

-- CreateIndex
CREATE INDEX "class_enrollments_learnerId_active_idx" ON "class_enrollments"("learnerId", "active");

-- CreateIndex
CREATE INDEX "class_enrollments_classId_active_idx" ON "class_enrollments"("classId", "active");

-- CreateIndex
CREATE INDEX "formative_assessments_learnerId_learningArea_term_academicY_idx" ON "formative_assessments"("learnerId", "learningArea", "term", "academicYear");

-- CreateIndex
CREATE INDEX "learners_schoolId_grade_stream_status_idx" ON "learners"("schoolId", "grade", "stream", "status");

-- CreateIndex
CREATE INDEX "summative_results_testId_grade_marksObtained_idx" ON "summative_results"("testId", "grade", "marksObtained");

-- CreateIndex
CREATE INDEX "summative_tests_schoolId_grade_learningArea_term_idx" ON "summative_tests"("schoolId", "grade", "learningArea", "term");
