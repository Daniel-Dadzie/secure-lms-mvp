-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "highlights" TEXT[],
ADD COLUMN     "level" TEXT,
ADD COLUMN     "longDescription" TEXT;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "duration" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "shortBio" TEXT;
