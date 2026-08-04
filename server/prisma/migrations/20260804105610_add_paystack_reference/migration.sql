-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "providerReference" TEXT,
ALTER COLUMN "provider" SET DEFAULT 'PAYSTACK';

-- CreateIndex
CREATE INDEX "purchases_providerReference_idx" ON "purchases"("providerReference");
