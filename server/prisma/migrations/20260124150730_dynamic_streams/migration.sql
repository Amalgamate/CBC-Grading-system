/*
  Warnings:

  - The `stream` column on the `classes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stream` column on the `learners` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "classes" DROP COLUMN "stream",
ADD COLUMN     "stream" TEXT;

-- AlterTable
ALTER TABLE "learners" DROP COLUMN "stream",
ADD COLUMN     "stream" TEXT;

-- DropEnum
DROP TYPE "Stream";

-- CreateTable
CREATE TABLE "stream_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stream_configs_schoolId_idx" ON "stream_configs"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "stream_configs_schoolId_name_key" ON "stream_configs"("schoolId", "name");

-- CreateIndex
CREATE INDEX "classes_grade_stream_idx" ON "classes"("grade", "stream");

-- CreateIndex
CREATE UNIQUE INDEX "classes_branchId_grade_stream_academicYear_term_key" ON "classes"("branchId", "grade", "stream", "academicYear", "term");

-- CreateIndex
CREATE INDEX "learners_grade_stream_idx" ON "learners"("grade", "stream");

-- AddForeignKey
ALTER TABLE "stream_configs" ADD CONSTRAINT "stream_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
