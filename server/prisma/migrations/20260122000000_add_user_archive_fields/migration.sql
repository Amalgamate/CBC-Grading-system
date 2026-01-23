-- Migration: Add archive fields to users table
-- This allows soft delete functionality for teachers to archive parents

-- Add archive fields
ALTER TABLE "users" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "archivedBy" TEXT;

-- Add index for faster archive queries
CREATE INDEX "users_archived_idx" ON "users"("archived");
