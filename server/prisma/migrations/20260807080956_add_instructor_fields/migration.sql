-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "credentials" TEXT,
ADD COLUMN     "experienceYears" TEXT,
ADD COLUMN     "instructorCategory" TEXT,
ADD COLUMN     "specialization" TEXT;
