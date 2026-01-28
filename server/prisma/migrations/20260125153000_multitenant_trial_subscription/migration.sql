-- Multi-tenant trial & subscription schema changes
-- PostgreSQL

-- School status and trial tracking
ALTER TABLE "schools"
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "trialStart" TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS "trialDays" INTEGER DEFAULT 30;

-- Subscription plans
CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT UNIQUE NOT NULL,
  "modules" JSONB NOT NULL,
  "maxBranches" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- School subscriptions
CREATE TABLE IF NOT EXISTS "school_subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "schoolId" TEXT NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "planId" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE RESTRICT,
  "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_school_subscriptions_school" ON "school_subscriptions"("schoolId");
CREATE INDEX IF NOT EXISTS "idx_school_subscriptions_plan" ON "school_subscriptions"("planId");
