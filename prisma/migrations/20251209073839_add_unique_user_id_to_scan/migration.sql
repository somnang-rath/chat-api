/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ScanLocation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScanLocation" ALTER COLUMN "scan" SET DEFAULT false,
ALTER COLUMN "distance" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ScanLocation_userId_key" ON "ScanLocation"("userId");
