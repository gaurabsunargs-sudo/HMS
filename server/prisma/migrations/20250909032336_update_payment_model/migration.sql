/*
  Warnings:

  - The values [KHALTI] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- First, update any existing KHALTI payments to BANK
UPDATE "payments" SET "paymentMethod" = 'CASH' WHERE "paymentMethod" = 'KHALTI';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'BANK');
ALTER TABLE "payments" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "authorizationCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "receiptNo" TEXT,
ADD COLUMN     "receivedBy" TEXT;
