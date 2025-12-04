/*
  Warnings:

  - The primary key for the `LatestPoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,chatId]` on the table `LatestPoint` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `LatestPoint` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "LatestPoint" DROP CONSTRAINT "LatestPoint_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "ts" DROP NOT NULL,
ADD CONSTRAINT "LatestPoint_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "LatestPoint_userId_chatId_key" ON "LatestPoint"("userId", "chatId");
