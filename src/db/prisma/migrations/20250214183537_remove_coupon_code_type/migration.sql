/*
  Warnings:

  - The values [Discount] on the enum `CouponCodeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `discountType` on the `Coupons` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CustomersCoupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CouponCodeType_new" AS ENUM ('Percentage', 'Fixed');
ALTER TYPE "CouponCodeType" RENAME TO "CouponCodeType_old";
ALTER TYPE "CouponCodeType_new" RENAME TO "CouponCodeType";
DROP TYPE "CouponCodeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Clients" ADD COLUMN     "couponValidity" INTEGER;

-- AlterTable
ALTER TABLE "Coupons" DROP COLUMN "discountType",
ALTER COLUMN "validFrom" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "CustomersCoupons" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
