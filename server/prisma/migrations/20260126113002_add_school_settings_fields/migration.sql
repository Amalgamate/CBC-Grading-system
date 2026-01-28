/*
  Warnings:

  - Added the required column `schoolId` to the `fee_structures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "motto" TEXT,
ADD COLUMN     "vision" TEXT;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
