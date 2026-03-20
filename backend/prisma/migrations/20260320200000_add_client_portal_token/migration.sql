-- AlterTable: add portalToken with generated UUID for existing clients
ALTER TABLE "Client" ADD COLUMN "portalToken" TEXT;

-- Fill existing clients with unique UUIDs
UPDATE "Client" SET "portalToken" = gen_random_uuid()::text WHERE "portalToken" IS NULL;

-- CreateIndex (unique)
CREATE UNIQUE INDEX "Client_portalToken_key" ON "Client"("portalToken");
