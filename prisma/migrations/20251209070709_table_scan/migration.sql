-- CreateTable
CREATE TABLE "ScanLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scan" BOOLEAN NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ScanLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScanLocation" ADD CONSTRAINT "ScanLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
