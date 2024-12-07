-- CreateEnum
CREATE TYPE "MfaType" AS ENUM ('TOTP', 'EMAIL', 'BACKUP_CODES', 'NONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "full_name" TEXT,
    "image_url" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "has_verified_email_address" BOOLEAN NOT NULL DEFAULT false,
    "last_sign_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "fingerprint_id" TEXT NOT NULL,
    "fingerprint_data" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mfa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MfaType" NOT NULL DEFAULT 'NONE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "secret" TEXT,
    "friendly_name" TEXT NOT NULL,
    "qr_code_url" TEXT,
    "backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mfa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_fingerprint_id_idx" ON "Session"("fingerprint_id");

-- CreateIndex
CREATE INDEX "Mfa_userId_idx" ON "Mfa"("userId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mfa" ADD CONSTRAINT "Mfa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
