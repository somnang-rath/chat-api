-- CreateTable
CREATE TABLE "LatestPoint" (
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "ts" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestPoint_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "LatestPoint" ADD CONSTRAINT "LatestPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LatestPoint" ADD CONSTRAINT "LatestPoint_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
