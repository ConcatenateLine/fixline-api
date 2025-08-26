/*
  Warnings:

  - You are about to drop the column `domain` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the `_TenantToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'GUEST');

-- DropForeignKey
ALTER TABLE "public"."_TenantToUser" DROP CONSTRAINT "_TenantToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TenantToUser" DROP CONSTRAINT "_TenantToUser_B_fkey";

-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "domain",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."_TenantToUser";

-- CreateTable
CREATE TABLE "public"."TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'GUEST',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "public"."TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "public"."Tenant"("slug");

-- AddForeignKey
ALTER TABLE "public"."TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
