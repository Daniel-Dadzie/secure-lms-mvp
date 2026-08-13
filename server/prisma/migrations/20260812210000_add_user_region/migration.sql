-- CreateEnum
CREATE TYPE "UserRegion" AS ENUM ('NORTH_AMERICA', 'LATIN_AMERICA', 'EUROPE', 'AFRICA', 'MIDDLE_EAST', 'ASIA_PACIFIC');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "region" "UserRegion",
ADD COLUMN "detectedTimezone" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "buyerRegion" "UserRegion",
ADD COLUMN "buyerTimezone" TEXT;

-- CreateIndex
CREATE INDEX "users_region_idx" ON "users"("region");
