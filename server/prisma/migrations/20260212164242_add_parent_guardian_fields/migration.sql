-- Add father/mother/guardian fields to learners table
ALTER TABLE "learners" ADD COLUMN "fatherName" TEXT,
ADD COLUMN "fatherPhone" TEXT,
ADD COLUMN "fatherEmail" TEXT,
ADD COLUMN "fatherDeceased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "motherName" TEXT,
ADD COLUMN "motherPhone" TEXT,
ADD COLUMN "motherEmail" TEXT,
ADD COLUMN "motherDeceased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "guardianRelation" TEXT,
ADD COLUMN "primaryContactType" TEXT,
ADD COLUMN "primaryContactName" TEXT,
ADD COLUMN "primaryContactPhone" TEXT,
ADD COLUMN "primaryContactEmail" TEXT;

-- Add index for primaryContactType
CREATE INDEX "learners_primaryContactType_idx" ON "learners"("primaryContactType");
