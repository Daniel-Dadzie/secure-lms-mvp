-- Add structured metadata to student activity records.
ALTER TABLE "activities"
ADD COLUMN "metadata" JSONB;
