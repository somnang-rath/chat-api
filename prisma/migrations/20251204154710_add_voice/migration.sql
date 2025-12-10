-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'audio', 'image', 'file');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isPlayed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'text';
