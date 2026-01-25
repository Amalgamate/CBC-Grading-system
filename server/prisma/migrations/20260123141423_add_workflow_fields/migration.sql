-- AlterTable
ALTER TABLE "formative_assessments" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT;

-- AlterTable
ALTER TABLE "summative_tests" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT,
ADD COLUMN     "statusHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
