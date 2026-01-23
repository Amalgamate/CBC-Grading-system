-- CreateEnum
CREATE TYPE "DetailedRubricRating" AS ENUM ('EE1', 'EE2', 'ME1', 'ME2', 'AE1', 'AE2', 'BE1', 'BE2');

-- AlterTable
ALTER TABLE "formative_assessments" ADD COLUMN     "detailedRating" "DetailedRubricRating",
ADD COLUMN     "percentage" DOUBLE PRECISION,
ADD COLUMN     "points" INTEGER;
