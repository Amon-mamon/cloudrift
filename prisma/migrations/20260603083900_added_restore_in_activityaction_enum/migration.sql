-- CreateEnum
CREATE TYPE "DbFileType" AS ENUM ('SQL', 'DB', 'CSV', 'JSON', 'DUMP', 'ENV', 'SQLITE', 'OTHER');

-- CreateEnum
CREATE TYPE "FileSharePermission" AS ENUM ('FULL_ACCESS', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('UPLOAD', 'DOWNLOAD', 'SHARE', 'DELETE', 'AI', 'ACCESS', 'CREATE', 'UPDATE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'supabase',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "engine" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DbFile" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "projectId" UUID,
    "name" TEXT NOT NULL,
    "type" "DbFileType" NOT NULL DEFAULT 'OTHER',
    "sizeBytes" BIGINT,
    "engine" TEXT,
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "storagePath" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DbFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileShare" (
    "id" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "sharedWithUserId" UUID,
    "sharedWithEmail" TEXT NOT NULL,
    "permission" "FileSharePermission" NOT NULL DEFAULT 'READ_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "fileId" UUID,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "DbFile_ownerId_idx" ON "DbFile"("ownerId");

-- CreateIndex
CREATE INDEX "DbFile_projectId_idx" ON "DbFile"("projectId");

-- CreateIndex
CREATE INDEX "FileShare_ownerId_idx" ON "FileShare"("ownerId");

-- CreateIndex
CREATE INDEX "FileShare_sharedWithUserId_idx" ON "FileShare"("sharedWithUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FileShare_fileId_sharedWithEmail_key" ON "FileShare"("fileId", "sharedWithEmail");

-- CreateIndex
CREATE INDEX "ActivityLog_ownerId_idx" ON "ActivityLog"("ownerId");

-- CreateIndex
CREATE INDEX "ActivityLog_fileId_idx" ON "ActivityLog"("fileId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DbFile" ADD CONSTRAINT "DbFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DbFile" ADD CONSTRAINT "DbFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "DbFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "DbFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
