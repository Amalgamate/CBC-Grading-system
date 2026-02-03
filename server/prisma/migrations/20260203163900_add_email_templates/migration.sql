-- AlterTable
ALTER TABLE "communication_configs" ADD COLUMN     "emailTemplates" JSONB;

-- CreateTable
CREATE TABLE "learning_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "gradeLevel" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📚',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "description" TEXT,
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_areas_gradeLevel_idx" ON "learning_areas"("gradeLevel");

-- CreateIndex
CREATE INDEX "learning_areas_schoolId_idx" ON "learning_areas"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_areas_schoolId_name_key" ON "learning_areas"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "learning_areas" ADD CONSTRAINT "learning_areas_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
