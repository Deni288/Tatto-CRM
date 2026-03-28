-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleConnectedAt" TIMESTAMP(3),
ADD COLUMN     "googleRefreshToken" TEXT;
