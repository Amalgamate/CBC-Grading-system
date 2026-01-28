/*
  Warnings:

  - The primary key for the `school_subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `subscription_plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `status` on table `schools` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "school_subscriptions" DROP CONSTRAINT "school_subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "school_subscriptions" DROP CONSTRAINT "school_subscriptions_schoolId_fkey";

-- AlterTable
ALTER TABLE "formative_assessments" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "school_subscriptions" DROP CONSTRAINT "school_subscriptions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "planId" SET DATA TYPE TEXT,
ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "school_subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "trialStart" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "summative_results" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "emailVerificationSentAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "phoneVerificationSentAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "formative_assessments_schoolId_idx" ON "formative_assessments"("schoolId");

-- CreateIndex
CREATE INDEX "formative_assessments_branchId_idx" ON "formative_assessments"("branchId");

-- CreateIndex
CREATE INDEX "summative_results_schoolId_idx" ON "summative_results"("schoolId");

-- CreateIndex
CREATE INDEX "summative_results_branchId_idx" ON "summative_results"("branchId");

-- CreateIndex
CREATE INDEX "summative_tests_schoolId_idx" ON "summative_tests"("schoolId");

-- CreateIndex
CREATE INDEX "summative_tests_branchId_idx" ON "summative_tests"("branchId");

-- AddForeignKey
ALTER TABLE "school_subscriptions" ADD CONSTRAINT "school_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subscriptions" ADD CONSTRAINT "school_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_school_subscriptions_plan" RENAME TO "school_subscriptions_planId_idx";

-- RenameIndex
ALTER INDEX "idx_school_subscriptions_school" RENAME TO "school_subscriptions_schoolId_idx";
