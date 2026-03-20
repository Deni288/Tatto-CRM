-- CreateIndex: artistId on Client, Appointment, BookingRequest for query performance
CREATE INDEX "Client_artistId_idx" ON "Client"("artistId");
CREATE INDEX "Appointment_artistId_idx" ON "Appointment"("artistId");
CREATE INDEX "BookingRequest_artistId_idx" ON "BookingRequest"("artistId");
