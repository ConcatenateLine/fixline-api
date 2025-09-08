/*
  Warnings:

  - You are about to drop the column `accountId` on the `BillingEvent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BillingEvent" DROP CONSTRAINT "BillingEvent_accountId_fkey";

-- AlterTable
ALTER TABLE "public"."BillingEvent" DROP COLUMN "accountId";
