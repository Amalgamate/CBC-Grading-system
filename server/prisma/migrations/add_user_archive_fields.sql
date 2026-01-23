-- Migration: Add archive fields to users table
-- This allows soft delete functionality for teachers to archive parents

-- Add archive fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "archivedBy" TEXT;

-- Add index for faster archive queries
CREATE INDEX IF NOT EXISTS idx_users_archived ON users(archived);

-- Add comment
COMMENT ON COLUMN users.archived IS 'Soft delete flag - true when user is archived';
COMMENT ON COLUMN users."archivedAt" IS 'Timestamp when user was archived';
COMMENT ON COLUMN users."archivedBy" IS 'User ID of person who archived this user';
