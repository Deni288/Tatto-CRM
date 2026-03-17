-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "artistId" TEXT;

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
