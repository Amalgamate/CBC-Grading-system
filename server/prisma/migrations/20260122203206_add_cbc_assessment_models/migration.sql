-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('TUITION', 'TRANSPORT', 'MEALS', 'ACTIVITY', 'UNIFORM', 'BOOKS', 'EXAM', 'LATE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERPAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MPESA', 'BANK_TRANSFER', 'CHEQUE', 'CARD');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('INDIVIDUAL', 'CLASS', 'GRADE', 'ALL_PARENTS', 'ALL_TEACHERS', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "admission_sequences" DROP CONSTRAINT "admission_sequences_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_branchId_fkey";

-- DropForeignKey
ALTER TABLE "learners" DROP CONSTRAINT "learners_branchId_fkey";

-- DropForeignKey
ALTER TABLE "learners" DROP CONSTRAINT "learners_schoolId_fkey";

-- DropIndex
DROP INDEX "classes_grade_stream_academicYear_term_key";

-- DropIndex
DROP INDEX "learners_admissionNumber_key";

-- DropIndex
DROP INDEX "users_archived_idx";

-- CreateTable
CREATE TABLE "core_competencies" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "communication" "DetailedRubricRating" NOT NULL,
    "communicationComment" TEXT,
    "criticalThinking" "DetailedRubricRating" NOT NULL,
    "criticalThinkingComment" TEXT,
    "creativity" "DetailedRubricRating" NOT NULL,
    "creativityComment" TEXT,
    "collaboration" "DetailedRubricRating" NOT NULL,
    "collaborationComment" TEXT,
    "citizenship" "DetailedRubricRating" NOT NULL,
    "citizenshipComment" TEXT,
    "learningToLearn" "DetailedRubricRating" NOT NULL,
    "learningToLearnComment" TEXT,
    "assessedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "values_assessments" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "love" "DetailedRubricRating" NOT NULL,
    "responsibility" "DetailedRubricRating" NOT NULL,
    "respect" "DetailedRubricRating" NOT NULL,
    "unity" "DetailedRubricRating" NOT NULL,
    "peace" "DetailedRubricRating" NOT NULL,
    "patriotism" "DetailedRubricRating" NOT NULL,
    "integrity" "DetailedRubricRating" NOT NULL,
    "comment" TEXT,
    "assessedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "values_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_curricular_activities" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "activityName" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "performance" "DetailedRubricRating" NOT NULL,
    "achievements" TEXT,
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "co_curricular_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "termly_report_comments" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "classTeacherComment" TEXT NOT NULL,
    "classTeacherName" TEXT NOT NULL,
    "classTeacherSignature" TEXT,
    "classTeacherDate" TIMESTAMP(3) NOT NULL,
    "headTeacherComment" TEXT,
    "headTeacherName" TEXT,
    "headTeacherSignature" TEXT,
    "headTeacherDate" TIMESTAMP(3),
    "parentComment" TEXT,
    "parentSignature" TEXT,
    "parentDate" TIMESTAMP(3),
    "nextTermOpens" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "termly_report_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "feeType" "FeeType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "grade" "Grade",
    "term" "Term",
    "academicYear" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "issuedBy" TEXT NOT NULL,

    CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "UserRole" NOT NULL,
    "recipientType" "RecipientType" NOT NULL,
    "recipientIds" TEXT[],
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'IN_APP',
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" "MessageStatus" NOT NULL DEFAULT 'DRAFT',
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_receipts" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "core_competencies_learnerId_idx" ON "core_competencies"("learnerId");

-- CreateIndex
CREATE INDEX "core_competencies_term_academicYear_idx" ON "core_competencies"("term", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "core_competencies_learnerId_term_academicYear_key" ON "core_competencies"("learnerId", "term", "academicYear");

-- CreateIndex
CREATE INDEX "values_assessments_learnerId_idx" ON "values_assessments"("learnerId");

-- CreateIndex
CREATE INDEX "values_assessments_term_academicYear_idx" ON "values_assessments"("term", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "values_assessments_learnerId_term_academicYear_key" ON "values_assessments"("learnerId", "term", "academicYear");

-- CreateIndex
CREATE INDEX "co_curricular_activities_learnerId_idx" ON "co_curricular_activities"("learnerId");

-- CreateIndex
CREATE INDEX "co_curricular_activities_term_academicYear_idx" ON "co_curricular_activities"("term", "academicYear");

-- CreateIndex
CREATE INDEX "co_curricular_activities_activityType_idx" ON "co_curricular_activities"("activityType");

-- CreateIndex
CREATE INDEX "termly_report_comments_learnerId_idx" ON "termly_report_comments"("learnerId");

-- CreateIndex
CREATE INDEX "termly_report_comments_term_academicYear_idx" ON "termly_report_comments"("term", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "termly_report_comments_learnerId_term_academicYear_key" ON "termly_report_comments"("learnerId", "term", "academicYear");

-- CreateIndex
CREATE INDEX "fee_structures_grade_term_academicYear_idx" ON "fee_structures"("grade", "term", "academicYear");

-- CreateIndex
CREATE INDEX "fee_structures_feeType_idx" ON "fee_structures"("feeType");

-- CreateIndex
CREATE UNIQUE INDEX "fee_invoices_invoiceNumber_key" ON "fee_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "fee_invoices_learnerId_idx" ON "fee_invoices"("learnerId");

-- CreateIndex
CREATE INDEX "fee_invoices_term_academicYear_idx" ON "fee_invoices"("term", "academicYear");

-- CreateIndex
CREATE INDEX "fee_invoices_status_idx" ON "fee_invoices"("status");

-- CreateIndex
CREATE INDEX "fee_invoices_dueDate_idx" ON "fee_invoices"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "fee_payments_receiptNumber_key" ON "fee_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "fee_payments_invoiceId_idx" ON "fee_payments"("invoiceId");

-- CreateIndex
CREATE INDEX "fee_payments_paymentDate_idx" ON "fee_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "fee_payments_paymentMethod_idx" ON "fee_payments"("paymentMethod");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");

-- CreateIndex
CREATE INDEX "messages_messageType_idx" ON "messages"("messageType");

-- CreateIndex
CREATE INDEX "messages_scheduledFor_idx" ON "messages"("scheduledFor");

-- CreateIndex
CREATE INDEX "message_receipts_messageId_idx" ON "message_receipts"("messageId");

-- CreateIndex
CREATE INDEX "message_receipts_recipientId_idx" ON "message_receipts"("recipientId");

-- CreateIndex
CREATE INDEX "message_receipts_status_idx" ON "message_receipts"("status");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_sequences" ADD CONSTRAINT "admission_sequences_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_competencies" ADD CONSTRAINT "core_competencies_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_competencies" ADD CONSTRAINT "core_competencies_assessedBy_fkey" FOREIGN KEY ("assessedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "values_assessments" ADD CONSTRAINT "values_assessments_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "values_assessments" ADD CONSTRAINT "values_assessments_assessedBy_fkey" FOREIGN KEY ("assessedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_curricular_activities" ADD CONSTRAINT "co_curricular_activities_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_curricular_activities" ADD CONSTRAINT "co_curricular_activities_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "termly_report_comments" ADD CONSTRAINT "termly_report_comments_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fee_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
