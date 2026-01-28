/*
  Warnings:

  - Made the column `schoolId` on table `formative_assessments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `schoolId` on table `summative_results` required. This step will fail if there are existing NULL values in that column.
  - Made the column `schoolId` on table `summative_tests` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "formative_assessments" DROP CONSTRAINT "formative_assessments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "summative_results" DROP CONSTRAINT "summative_results_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "summative_tests" DROP CONSTRAINT "summative_tests_schoolId_fkey";

-- AlterTable
ALTER TABLE "formative_assessments" ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "summative_results" ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "summative_tests" ALTER COLUMN "schoolId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
