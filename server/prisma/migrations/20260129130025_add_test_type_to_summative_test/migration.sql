-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "testType" TEXT;

-- CreateIndex
CREATE INDEX "summative_tests_testType_idx" ON "summative_tests"("testType");
