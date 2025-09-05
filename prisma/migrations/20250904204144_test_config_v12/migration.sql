/*
  Warnings:

  - The values [month,year] on the enum `BillingInterval` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BillingInterval_new" AS ENUM ('MONTH', 'YEAR');
ALTER TABLE "public"."PlanPrice" ALTER COLUMN "interval" TYPE "public"."BillingInterval_new" USING ("interval"::text::"public"."BillingInterval_new");
ALTER TYPE "public"."BillingInterval" RENAME TO "BillingInterval_old";
ALTER TYPE "public"."BillingInterval_new" RENAME TO "BillingInterval";
DROP TYPE "public"."BillingInterval_old";
COMMIT;
