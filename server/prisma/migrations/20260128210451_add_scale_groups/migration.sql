-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER', 'TEACHER', 'PARENT', 'ACCOUNTANT', 'RECEPTIONIST', 'LIBRARIAN', 'NURSE', 'SECURITY', 'DRIVER', 'COOK', 'CLEANER', 'GROUNDSKEEPER', 'IT_SUPPORT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('CRECHE', 'RECEPTION', 'TRANSITION', 'PLAYGROUP', 'PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');

-- CreateEnum
CREATE TYPE "LearnerStatus" AS ENUM ('ACTIVE', 'TRANSFERRED_OUT', 'GRADUATED', 'DROPPED_OUT', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Term" AS ENUM ('TERM_1', 'TERM_2', 'TERM_3');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK');

-- CreateEnum
CREATE TYPE "FormativeAssessmentType" AS ENUM ('OPENER', 'WEEKLY', 'MONTHLY', 'CAT', 'MID_TERM', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'QUIZ', 'OBSERVATION', 'ORAL', 'EXAM', 'OTHER');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AggregationStrategy" AS ENUM ('SIMPLE_AVERAGE', 'BEST_N', 'DROP_LOWEST_N', 'WEIGHTED_AVERAGE', 'MEDIAN');

-- CreateEnum
CREATE TYPE "CurriculumType" AS ENUM ('CBC_ONLY', 'EXAM_ONLY', 'CBC_AND_EXAM', 'IGCSE', 'CAMBRIDGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('FORMATIVE_ONLY', 'SUMMATIVE_ONLY', 'MIXED');

-- CreateEnum
CREATE TYPE "AdmissionFormatType" AS ENUM ('NO_BRANCH', 'BRANCH_PREFIX_START', 'BRANCH_PREFIX_MIDDLE', 'BRANCH_PREFIX_END');

-- CreateEnum
CREATE TYPE "RubricRating" AS ENUM ('EE', 'ME', 'AE', 'BE');

-- CreateEnum
CREATE TYPE "DetailedRubricRating" AS ENUM ('EE1', 'EE2', 'ME1', 'ME2', 'AE1', 'AE2', 'BE1', 'BE2');

-- CreateEnum
CREATE TYPE "SummativeGrade" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "IDCardType" AS ENUM ('STUDENT', 'STAFF', 'VISITOR', 'TEMPORARY');

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

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TEACHER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerificationSentAt" TIMESTAMP(3),
    "phoneVerificationCode" TEXT,
    "phoneVerificationSentAt" TIMESTAMP(3),
    "schoolId" TEXT,
    "branchId" TEXT,
    "staffId" TEXT,
    "idCardPhoto" TEXT,
    "idCardIssued" TIMESTAMP(3),
    "idCardExpiry" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNo" TEXT,
    "address" TEXT,
    "county" TEXT,
    "subCounty" TEXT,
    "ward" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "principalName" TEXT,
    "principalPhone" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "schoolType" TEXT,
    "motto" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "admissionFormatType" "AdmissionFormatType" NOT NULL DEFAULT 'BRANCH_PREFIX_START',
    "branchSeparator" TEXT NOT NULL DEFAULT '-',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "trialStart" TIMESTAMP(3),
    "trialDays" INTEGER DEFAULT 30,
    "curriculumType" "CurriculumType" NOT NULL DEFAULT 'CBC_AND_EXAM',
    "assessmentMode" "AssessmentMode" NOT NULL DEFAULT 'MIXED',
    "customGradingScale" JSONB,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modules" JSONB NOT NULL,
    "maxBranches" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_subscriptions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "principalName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_sequences" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "stream" TEXT,
    "teacherId" TEXT,
    "academicYear" INTEGER NOT NULL DEFAULT 2025,
    "term" "Term" NOT NULL DEFAULT 'TERM_1',
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "room" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_enrollments" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learners" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "grade" "Grade" NOT NULL,
    "stream" TEXT,
    "parentId" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "guardianEmail" TEXT,
    "medicalConditions" TEXT,
    "allergies" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "bloodGroup" TEXT,
    "address" TEXT,
    "county" TEXT,
    "subCounty" TEXT,
    "status" "LearnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "exitReason" TEXT,
    "previousSchool" TEXT,
    "religion" TEXT,
    "specialNeeds" TEXT,
    "idCardIssued" TIMESTAMP(3),
    "idCardExpiry" TIMESTAMP(3),
    "idCardNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "learners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "classId" TEXT,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formative_assessments" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "term" "Term" NOT NULL DEFAULT 'TERM_1',
    "academicYear" INTEGER NOT NULL DEFAULT 2026,
    "learningArea" TEXT NOT NULL,
    "strand" TEXT,
    "subStrand" TEXT,
    "overallRating" "RubricRating" NOT NULL,
    "detailedRating" "DetailedRubricRating",
    "points" INTEGER,
    "percentage" DOUBLE PRECISION,
    "exceedingCount" INTEGER NOT NULL DEFAULT 0,
    "meetingCount" INTEGER NOT NULL DEFAULT 0,
    "approachingCount" INTEGER NOT NULL DEFAULT 0,
    "belowCount" INTEGER NOT NULL DEFAULT 0,
    "strengths" TEXT,
    "areasImprovement" TEXT,
    "remarks" TEXT,
    "recommendations" TEXT,
    "teacherId" TEXT NOT NULL,
    "type" "FormativeAssessmentType" NOT NULL DEFAULT 'OPENER',
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "maxScore" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formative_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summative_tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "learningArea" TEXT NOT NULL,
    "term" "Term" NOT NULL DEFAULT 'TERM_1',
    "academicYear" INTEGER NOT NULL DEFAULT 2026,
    "grade" "Grade" NOT NULL,
    "testDate" DATE NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "passMarks" INTEGER NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "instructions" TEXT,
    "createdBy" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "curriculum" "CurriculumType" NOT NULL DEFAULT 'CBC_AND_EXAM',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "statusHistory" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "scaleId" TEXT,
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "summative_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "term" "Term" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "formativeWeight" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "summativeWeight" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "term_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregation_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" "Grade",
    "learningArea" TEXT,
    "type" "FormativeAssessmentType" NOT NULL,
    "strategy" "AggregationStrategy" NOT NULL DEFAULT 'SIMPLE_AVERAGE',
    "nValue" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_history" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "change_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summative_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "marksObtained" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "grade" "SummativeGrade" NOT NULL,
    "status" "TestStatus" NOT NULL,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'DRAFT',
    "position" INTEGER,
    "outOf" INTEGER,
    "remarks" TEXT,
    "teacherComment" TEXT,
    "recordedBy" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "summative_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summative_result_history" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changeTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "summative_result_history_pkey" PRIMARY KEY ("id")
);

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
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

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
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

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
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "id_card_templates_pkey" PRIMARY KEY ("id")
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
    "schoolId" TEXT NOT NULL,
    "branchId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

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
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

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

-- CreateTable
CREATE TABLE "scale_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schoolId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "scale_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scaleGroupId" TEXT,
    "grade" "Grade",
    "learningArea" TEXT,
    "schoolId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_ranges" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minPercentage" DOUBLE PRECISION NOT NULL,
    "maxPercentage" DOUBLE PRECISION NOT NULL,
    "summativeGrade" "SummativeGrade",
    "rubricRating" "DetailedRubricRating",
    "points" INTEGER,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,

    CONSTRAINT "grading_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_staffId_key" ON "users"("staffId");

-- CreateIndex
CREATE INDEX "users_schoolId_idx" ON "users"("schoolId");

-- CreateIndex
CREATE INDEX "users_branchId_idx" ON "users"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_registrationNo_key" ON "schools"("registrationNo");

-- CreateIndex
CREATE INDEX "schools_county_idx" ON "schools"("county");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "school_subscriptions_schoolId_idx" ON "school_subscriptions"("schoolId");

-- CreateIndex
CREATE INDEX "school_subscriptions_planId_idx" ON "school_subscriptions"("planId");

-- CreateIndex
CREATE INDEX "branches_schoolId_idx" ON "branches"("schoolId");

-- CreateIndex
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_schoolId_code_key" ON "branches"("schoolId", "code");

-- CreateIndex
CREATE INDEX "admission_sequences_schoolId_idx" ON "admission_sequences"("schoolId");

-- CreateIndex
CREATE INDEX "admission_sequences_academicYear_idx" ON "admission_sequences"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "admission_sequences_schoolId_academicYear_key" ON "admission_sequences"("schoolId", "academicYear");

-- CreateIndex
CREATE INDEX "classes_branchId_idx" ON "classes"("branchId");

-- CreateIndex
CREATE INDEX "classes_teacherId_idx" ON "classes"("teacherId");

-- CreateIndex
CREATE INDEX "classes_grade_stream_idx" ON "classes"("grade", "stream");

-- CreateIndex
CREATE UNIQUE INDEX "classes_branchId_grade_stream_academicYear_term_key" ON "classes"("branchId", "grade", "stream", "academicYear", "term");

-- CreateIndex
CREATE INDEX "class_enrollments_classId_idx" ON "class_enrollments"("classId");

-- CreateIndex
CREATE INDEX "class_enrollments_learnerId_idx" ON "class_enrollments"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "class_enrollments_classId_learnerId_key" ON "class_enrollments"("classId", "learnerId");

-- CreateIndex
CREATE INDEX "learners_schoolId_idx" ON "learners"("schoolId");

-- CreateIndex
CREATE INDEX "learners_branchId_idx" ON "learners"("branchId");

-- CreateIndex
CREATE INDEX "learners_admissionNumber_idx" ON "learners"("admissionNumber");

-- CreateIndex
CREATE INDEX "learners_parentId_idx" ON "learners"("parentId");

-- CreateIndex
CREATE INDEX "learners_grade_stream_idx" ON "learners"("grade", "stream");

-- CreateIndex
CREATE INDEX "learners_status_idx" ON "learners"("status");

-- CreateIndex
CREATE INDEX "learners_lastName_firstName_idx" ON "learners"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "learners_schoolId_admissionNumber_key" ON "learners"("schoolId", "admissionNumber");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_learnerId_idx" ON "attendances"("learnerId");

-- CreateIndex
CREATE INDEX "attendances_classId_idx" ON "attendances"("classId");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_learnerId_date_key" ON "attendances"("learnerId", "date");

-- CreateIndex
CREATE INDEX "formative_assessments_schoolId_idx" ON "formative_assessments"("schoolId");

-- CreateIndex
CREATE INDEX "formative_assessments_branchId_idx" ON "formative_assessments"("branchId");

-- CreateIndex
CREATE INDEX "formative_assessments_learnerId_idx" ON "formative_assessments"("learnerId");

-- CreateIndex
CREATE INDEX "formative_assessments_teacherId_idx" ON "formative_assessments"("teacherId");

-- CreateIndex
CREATE INDEX "formative_assessments_term_academicYear_idx" ON "formative_assessments"("term", "academicYear");

-- CreateIndex
CREATE INDEX "formative_assessments_learningArea_idx" ON "formative_assessments"("learningArea");

-- CreateIndex
CREATE UNIQUE INDEX "formative_assessments_learnerId_term_academicYear_learningA_key" ON "formative_assessments"("learnerId", "term", "academicYear", "learningArea", "type", "title");

-- CreateIndex
CREATE INDEX "summative_tests_schoolId_idx" ON "summative_tests"("schoolId");

-- CreateIndex
CREATE INDEX "summative_tests_branchId_idx" ON "summative_tests"("branchId");

-- CreateIndex
CREATE INDEX "summative_tests_grade_term_academicYear_idx" ON "summative_tests"("grade", "term", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "term_configs_schoolId_academicYear_term_key" ON "term_configs"("schoolId", "academicYear", "term");

-- CreateIndex
CREATE INDEX "change_history_schoolId_idx" ON "change_history"("schoolId");

-- CreateIndex
CREATE INDEX "change_history_entityType_entityId_idx" ON "change_history"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "summative_results_schoolId_idx" ON "summative_results"("schoolId");

-- CreateIndex
CREATE INDEX "summative_results_branchId_idx" ON "summative_results"("branchId");

-- CreateIndex
CREATE INDEX "summative_results_moderationStatus_idx" ON "summative_results"("moderationStatus");

-- CreateIndex
CREATE INDEX "summative_results_testId_idx" ON "summative_results"("testId");

-- CreateIndex
CREATE INDEX "summative_results_learnerId_idx" ON "summative_results"("learnerId");

-- CreateIndex
CREATE INDEX "summative_results_grade_idx" ON "summative_results"("grade");

-- CreateIndex
CREATE INDEX "summative_results_status_idx" ON "summative_results"("status");

-- CreateIndex
CREATE UNIQUE INDEX "summative_results_testId_learnerId_key" ON "summative_results"("testId", "learnerId");

-- CreateIndex
CREATE INDEX "summative_result_history_resultId_idx" ON "summative_result_history"("resultId");

-- CreateIndex
CREATE INDEX "summative_result_history_changedBy_idx" ON "summative_result_history"("changedBy");

-- CreateIndex
CREATE INDEX "summative_result_history_changeTimestamp_idx" ON "summative_result_history"("changeTimestamp");

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
CREATE UNIQUE INDEX "id_card_templates_templateName_key" ON "id_card_templates"("templateName");

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

-- CreateIndex
CREATE INDEX "scale_groups_schoolId_idx" ON "scale_groups"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "scale_groups_schoolId_name_key" ON "scale_groups"("schoolId", "name");

-- CreateIndex
CREATE INDEX "grading_systems_schoolId_idx" ON "grading_systems"("schoolId");

-- CreateIndex
CREATE INDEX "grading_systems_scaleGroupId_idx" ON "grading_systems"("scaleGroupId");

-- CreateIndex
CREATE INDEX "grading_systems_grade_idx" ON "grading_systems"("grade");

-- CreateIndex
CREATE INDEX "grading_ranges_systemId_idx" ON "grading_ranges"("systemId");

-- CreateIndex
CREATE INDEX "stream_configs_schoolId_idx" ON "stream_configs"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "stream_configs_schoolId_name_key" ON "stream_configs"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subscriptions" ADD CONSTRAINT "school_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subscriptions" ADD CONSTRAINT "school_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_sequences" ADD CONSTRAINT "admission_sequences_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formative_assessments" ADD CONSTRAINT "formative_assessments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "grading_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_tests" ADD CONSTRAINT "summative_tests_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_configs" ADD CONSTRAINT "term_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_configs" ADD CONSTRAINT "term_configs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregation_configs" ADD CONSTRAINT "aggregation_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregation_configs" ADD CONSTRAINT "aggregation_configs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "summative_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_results" ADD CONSTRAINT "summative_results_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_result_history" ADD CONSTRAINT "summative_result_history_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "summative_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summative_result_history" ADD CONSTRAINT "summative_result_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fee_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_groups" ADD CONSTRAINT "scale_groups_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_systems" ADD CONSTRAINT "grading_systems_scaleGroupId_fkey" FOREIGN KEY ("scaleGroupId") REFERENCES "scale_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_systems" ADD CONSTRAINT "grading_systems_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_ranges" ADD CONSTRAINT "grading_ranges_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "grading_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_configs" ADD CONSTRAINT "stream_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
