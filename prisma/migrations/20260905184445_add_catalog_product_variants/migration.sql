-- CreateTable
CREATE TABLE "catalog_product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "color" TEXT,
    "capacity" TEXT,
    "imageUrl" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" DECIMAL(10,2),
    "productUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_product_variants_productId_isActive_idx" ON "catalog_product_variants"("productId", "isActive");

-- AddForeignKey
ALTER TABLE "catalog_product_variants" ADD CONSTRAINT "catalog_product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
