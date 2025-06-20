/*
  Warnings:

  - You are about to drop the column `scheduled_date` on the `reminders` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_time` on the `reminders` table. All the data in the column will be lost.
  - Added the required column `scheduled_datetime` to the `reminders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."reminders" DROP COLUMN "scheduled_date",
DROP COLUMN "scheduled_time",
ADD COLUMN     "scheduled_datetime" TIMESTAMPTZ(6) NOT NULL;
