-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "purchases" ALTER COLUMN "currency" SET DEFAULT 'USD';
