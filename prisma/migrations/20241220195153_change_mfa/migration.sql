/*
  Warnings:

  - You are about to drop the column `qr_code_url` on the `Mfa` table. All the data in the column will be lost.
  - Made the column `secret` on table `Mfa` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mfa" DROP COLUMN "qr_code_url",
ALTER COLUMN "secret" SET NOT NULL,
ALTER COLUMN "friendly_name" DROP NOT NULL;
