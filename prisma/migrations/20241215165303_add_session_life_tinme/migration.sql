/*
  Warnings:

  - Added the required column `expires_at` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;
