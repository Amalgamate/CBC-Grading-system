-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('CRECHE', 'RECEPTION', 'TRANSITION', 'PLAYGROUP', 'PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');

-- CreateEnum
CREATE TYPE "Stream" AS ENUM ('A', 'B', 'C', 'D', 'EAST', 'WEST', 'NORTH', 'SOUTH', 'RED', 'BLUE', 'GREEN', 'YELLOW');

-- CreateEnum
CREATE TYPE "LearnerStatus" AS ENUM ('ACTIVE', 'TRANSFERRED_OUT', 'GRADUATED', 'DROPPED_OUT', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "learners" (
    "id" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "grade" "Grade" NOT NULL,
    "stream" "Stream",
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "learners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learners_admissionNumber_key" ON "learners"("admissionNumber");

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

-- AddForeignKey
ALTER TABLE "learners" ADD CONSTRAINT "learners_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
