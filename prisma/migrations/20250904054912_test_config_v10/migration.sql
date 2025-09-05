/*
  Warnings:

  - The values [VIEWER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `accountId` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatLimit` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."BillingInterval" AS ENUM ('month', 'year');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'AGENT', 'REPORTER', 'GUEST');
ALTER TABLE "public"."TenantMembership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."TenantMembership" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."TenantMembership" ALTER COLUMN "role" SET DEFAULT 'GUEST';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "seatLimit" INTEGER NOT NULL,
ADD COLUMN     "seatUsed" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maxTenants" INTEGER NOT NULL DEFAULT 1,
    "tenantsUsed" INTEGER NOT NULL DEFAULT 0,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BillingEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" JSONB NOT NULL,
    "accountId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanPrice" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "productId" TEXT,
    "priceId" TEXT NOT NULL,
    "interval" "public"."BillingInterval" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "planId" TEXT NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxTenants" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userEmail_key" ON "public"."Account"("userEmail");

-- CreateIndex
CREATE INDEX "Account_userEmail_idx" ON "public"."Account"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_eventId_key" ON "public"."BillingEvent"("eventId");

-- CreateIndex
CREATE INDEX "BillingEvent_type_receivedAt_idx" ON "public"."BillingEvent"("type", "receivedAt");

-- CreateIndex
CREATE INDEX "BillingEvent_subscriptionId_idx" ON "public"."BillingEvent"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_provider_eventId_key" ON "public"."BillingEvent"("provider", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_priceId_key" ON "public"."PlanPrice"("priceId");

-- CreateIndex
CREATE INDEX "PlanPrice_planId_idx" ON "public"."PlanPrice"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "public"."Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "public"."Subscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_accountId_planId_idx" ON "public"."Subscription"("accountId", "planId");

-- CreateIndex
CREATE INDEX "Tenant_accountId_idx" ON "public"."Tenant"("accountId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingEvent" ADD CONSTRAINT "BillingEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingEvent" ADD CONSTRAINT "BillingEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tenant" ADD CONSTRAINT "Tenant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
