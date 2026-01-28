-- AlterTable
ALTER TABLE "grading_systems" ADD COLUMN     "grade" "Grade",
ADD COLUMN     "learningArea" TEXT;

-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "scaleId" TEXT;

-- CreateIndex
CREATE INDEX "grading_systems_schoolId_idx" ON "grading_systems"("schoolId");

-- CreateIndex
CREATE INDEX "grading_systems_grade_idx" ON "grading_systems"("grade");

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "grading_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
