-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING';
ALTER TYPE "AppointmentStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "admissions" ADD COLUMN     "doctorId" TEXT;

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
