-- CreateEnum for DomainType
CREATE TYPE "DomainType" AS ENUM ('SUBDOMAIN', 'CUSTOM');

-- AlterTable: School - Add subdomain fields
ALTER TABLE "schools" ADD COLUMN     "subdomain" TEXT,
ADD COLUMN     "subdomainVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subdomainVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "customDomainVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customDomainVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "domainType" "DomainType" NOT NULL DEFAULT 'SUBDOMAIN';

-- CreateIndex: Unique subdomain
CREATE UNIQUE INDEX "schools_subdomain_key" ON "schools"("subdomain");

-- CreateIndex: Unique customDomain
CREATE UNIQUE INDEX "schools_customDomain_key" ON "schools"("customDomain");

-- CreateIndex: Composite index for querying active schools by subdomain
CREATE INDEX "schools_subdomain_active_archived_idx" ON "schools"("subdomain", "active", "archived");
