-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userEmail_fkey";

-- AlterTable
ALTER TABLE "public"."Account" ALTER COLUMN "userEmail" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
