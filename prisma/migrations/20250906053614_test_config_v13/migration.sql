/*
  Warnings:

  - Changed the type of `currency` on the `PlanPrice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'EUR', 'MXN');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."PlanPrice" DROP COLUMN "currency",
ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "status",
ADD COLUMN     "status" "public"."SubscriptionStatus" NOT NULL;
