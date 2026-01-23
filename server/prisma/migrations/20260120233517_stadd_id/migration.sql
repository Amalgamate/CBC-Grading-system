/*
  Warnings:

  - A unique constraint covering the columns `[staffId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "IDCardType" AS ENUM ('STUDENT', 'STAFF', 'VISITOR', 'TEMPORARY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'LIBRARIAN';
ALTER TYPE "UserRole" ADD VALUE 'NURSE';
ALTER TYPE "UserRole" ADD VALUE 'SECURITY';
ALTER TYPE "UserRole" ADD VALUE 'DRIVER';
ALTER TYPE "UserRole" ADD VALUE 'COOK';
ALTER TYPE "UserRole" ADD VALUE 'CLEANER';
ALTER TYPE "UserRole" ADD VALUE 'GROUNDSKEEPER';
ALTER TYPE "UserRole" ADD VALUE 'IT_SUPPORT';

-- DropForeignKey (only if tables exist)
-- Note: These tables may not exist yet in migration order
-- Commenting out to fix migration order issue

-- DropIndex (only if exists)
-- Note: These indexes may not exist yet
-- Commenting out to fix migration order issue

-- AlterTable
ALTER TABLE "learners" ADD COLUMN     "idCardExpiry" TIMESTAMP(3),
ADD COLUMN     "idCardIssued" TIMESTAMP(3),
ADD COLUMN     "idCardNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "idCardExpiry" TIMESTAMP(3),
ADD COLUMN     "idCardIssued" TIMESTAMP(3),
ADD COLUMN     "idCardPhoto" TEXT,
ADD COLUMN     "staffId" TEXT;

-- CreateTable
CREATE TABLE "id_card_templates" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateType" "IDCardType" NOT NULL,
    "templateDesign" TEXT NOT NULL,
    "templateCSS" TEXT,
    "layoutConfig" JSONB,
    "width" INTEGER NOT NULL DEFAULT 320,
    "height" INTEGER NOT NULL DEFAULT 204,
    "orientation" TEXT NOT NULL DEFAULT 'horizontal',
    "showPhoto" BOOLEAN NOT NULL DEFAULT true,
    "showBarcode" BOOLEAN NOT NULL DEFAULT true,
    "showQRCode" BOOLEAN NOT NULL DEFAULT false,
    "schoolLogo" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "id_card_templates_templateName_key" ON "id_card_templates"("templateName");

-- CreateIndex
CREATE UNIQUE INDEX "users_staffId_key" ON "users"("staffId");

-- AddForeignKey (only if tables exist)
-- Note: These foreign keys will be added by later migrations
-- Commenting out to fix migration order issue
