/*
  Warnings:

  - You are about to drop the column `scheduled_date` on the `adherence` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_time` on the `adherence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."adherence" DROP COLUMN "scheduled_date",
DROP COLUMN "scheduled_time",
ADD COLUMN     "scheduled_datetime" TIMESTAMPTZ(6);
