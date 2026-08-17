-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('VIDEO', 'TEXT');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "contentText" TEXT,
ADD COLUMN     "contentType" "LessonContentType" NOT NULL DEFAULT 'VIDEO';
