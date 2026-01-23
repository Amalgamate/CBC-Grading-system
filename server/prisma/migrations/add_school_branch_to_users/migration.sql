-- AlterTable User - Add school and branch associations
-- This migration adds schoolId and branchId to users for proper multi-tenancy

-- Add columns (nullable initially to allow existing data)
ALTER TABLE "users" ADD COLUMN "schoolId" TEXT;
ALTER TABLE "users" ADD COLUMN "branchId" TEXT;

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX "users_schoolId_idx" ON "users"("schoolId");
CREATE INDEX "users_branchId_idx" ON "users"("branchId");

-- Optional: Update existing users if you have a default school
-- Uncomment and modify if needed:
-- UPDATE "users" SET "schoolId" = 'your-default-school-id' WHERE "schoolId" IS NULL AND "role" != 'SUPER_ADMIN';
