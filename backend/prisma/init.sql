-- ─────────────────────────────────────────────
-- 盲盒抽卡应用 - 数据库初始化 Migration
-- Database: PostgreSQL
-- Generated from Prisma Schema
-- ─────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'SECRET');

-- CreateTable: box_series
CREATE TABLE "box_series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "box_series_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "box_series_name_key" ON "box_series"("name");

-- CreateTable: box_item
CREATE TABLE "box_item" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "rarity" "Rarity" NOT NULL,
    "description" TEXT,
    "seriesIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "box_item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "box_item_seriesId_idx" ON "box_item"("seriesId");
CREATE INDEX "box_item_rarity_idx" ON "box_item"("rarity");
CREATE UNIQUE INDEX "box_item_seriesId_seriesIndex_key" ON "box_item"("seriesId", "seriesIndex");
ALTER TABLE "box_item" ADD CONSTRAINT "box_item_seriesId_fkey"
    FOREIGN KEY ("seriesId") REFERENCES "box_series"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: anonymous_user
CREATE TABLE "anonymous_user" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "anonymous_user_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "anonymous_user_fingerprint_key" ON "anonymous_user"("fingerprint");

-- CreateTable: draw_record
CREATE TABLE "draw_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "draw_record_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "draw_record_userId_idx" ON "draw_record"("userId");
CREATE INDEX "draw_record_drawDate_idx" ON "draw_record"("drawDate");
CREATE INDEX "draw_record_itemId_idx" ON "draw_record"("itemId");
ALTER TABLE "draw_record" ADD CONSTRAINT "draw_record_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "anonymous_user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "draw_record" ADD CONSTRAINT "draw_record_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "box_item"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: collection
CREATE TABLE "collection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "collection_userId_idx" ON "collection"("userId");
CREATE UNIQUE INDEX "collection_userId_itemId_key" ON "collection"("userId", "itemId");
ALTER TABLE "collection" ADD CONSTRAINT "collection_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "anonymous_user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection" ADD CONSTRAINT "collection_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "box_item"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: draw_counter
CREATE TABLE "draw_counter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serieId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "draw_counter_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "draw_counter_userId_idx" ON "draw_counter"("userId");
CREATE UNIQUE INDEX "draw_counter_userId_serieId_key" ON "draw_counter"("userId", "serieId");
ALTER TABLE "draw_counter" ADD CONSTRAINT "draw_counter_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "anonymous_user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: share_record
CREATE TABLE "share_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'unknown',
    "shareDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "share_record_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "share_record_shareDate_idx" ON "share_record"("shareDate");
CREATE INDEX "share_record_userId_idx" ON "share_record"("userId");
ALTER TABLE "share_record" ADD CONSTRAINT "share_record_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "anonymous_user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "share_record" ADD CONSTRAINT "share_record_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "box_item"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: admin_user
CREATE TABLE "admin_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "admin_user_username_key" ON "admin_user"("username");
