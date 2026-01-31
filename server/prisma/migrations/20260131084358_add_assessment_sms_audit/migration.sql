-- CreateTable
CREATE TABLE "communication_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "smsProvider" TEXT DEFAULT 'mobilesasa',
    "smsApiKey" TEXT,
    "smsBaseUrl" TEXT DEFAULT 'https://api.mobilesasa.com',
    "smsSenderId" TEXT,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "hasApiKey" BOOLEAN NOT NULL DEFAULT false,
    "smsCustomName" TEXT,
    "smsCustomBaseUrl" TEXT,
    "smsCustomAuthHeader" TEXT,
    "smsCustomToken" TEXT,
    "emailProvider" TEXT DEFAULT 'resend',
    "emailApiKey" TEXT,
    "emailFrom" TEXT,
    "emailFromName" TEXT,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mpesaProvider" TEXT DEFAULT 'intasend',
    "mpesaPublicKey" TEXT,
    "mpesaSecretKey" TEXT,
    "mpesaBusinessNo" TEXT,
    "mpesaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_sms_audits" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "assessmentType" TEXT NOT NULL,
    "parentId" TEXT,
    "parentPhone" TEXT NOT NULL,
    "parentName" TEXT,
    "learnerName" TEXT NOT NULL,
    "learnerGrade" TEXT NOT NULL,
    "competencyName" TEXT,
    "achievementLevel" TEXT,
    "subStrand" TEXT,
    "templateType" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "smsMessageId" TEXT,
    "reportLink" TEXT,
    "smsStatus" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "sentByUserId" TEXT,
    "cooldownExpiry" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_sms_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "communication_configs_schoolId_key" ON "communication_configs"("schoolId");

-- CreateIndex
CREATE INDEX "assessment_sms_audits_learnerId_idx" ON "assessment_sms_audits"("learnerId");

-- CreateIndex
CREATE INDEX "assessment_sms_audits_parentPhone_idx" ON "assessment_sms_audits"("parentPhone");

-- CreateIndex
CREATE INDEX "assessment_sms_audits_sentAt_idx" ON "assessment_sms_audits"("sentAt");

-- CreateIndex
CREATE INDEX "assessment_sms_audits_smsStatus_idx" ON "assessment_sms_audits"("smsStatus");

-- CreateIndex
CREATE INDEX "assessment_sms_audits_schoolId_idx" ON "assessment_sms_audits"("schoolId");

-- AddForeignKey
ALTER TABLE "communication_configs" ADD CONSTRAINT "communication_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_sms_audits" ADD CONSTRAINT "assessment_sms_audits_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
