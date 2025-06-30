/*
  Warnings:

  - Made the column `scheduled_datetime` on table `adherence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."adherence" ALTER COLUMN "scheduled_datetime" SET NOT NULL;
