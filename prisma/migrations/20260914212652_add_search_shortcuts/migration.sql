-- CreateTable
CREATE TABLE "search_shortcuts" (
    "id" TEXT NOT NULL,
    "brandLabel" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_shortcuts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_shortcuts_isActive_idx" ON "search_shortcuts"("isActive");
