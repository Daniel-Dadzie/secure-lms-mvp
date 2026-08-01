-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rating_aggregates" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "oneStar" INTEGER NOT NULL DEFAULT 0,
    "twoStar" INTEGER NOT NULL DEFAULT 0,
    "threeStar" INTEGER NOT NULL DEFAULT 0,
    "fourStar" INTEGER NOT NULL DEFAULT 0,
    "fiveStar" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_aggregates_courseId_key" ON "rating_aggregates"("courseId");

-- AddForeignKey
ALTER TABLE "rating_aggregates" ADD CONSTRAINT "rating_aggregates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
