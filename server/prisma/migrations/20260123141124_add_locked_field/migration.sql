-- AlterTable
ALTER TABLE "formative_assessments" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;
