-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_ENROLLMENT';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "instructorReply" TEXT,
ADD COLUMN "instructorReplyAt" TIMESTAMP(3);
