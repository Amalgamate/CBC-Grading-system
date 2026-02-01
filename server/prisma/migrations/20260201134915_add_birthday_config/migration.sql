-- AlterTable
ALTER TABLE "communication_configs" ADD COLUMN     "birthdayEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthdayMessageTemplate" TEXT DEFAULT 'Happy Birthday {learnerName}! Best wishes from {schoolName}.';
