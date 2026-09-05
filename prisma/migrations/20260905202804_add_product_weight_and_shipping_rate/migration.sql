-- AlterTable
ALTER TABLE "catalog_products" ADD COLUMN     "weightGrams" INTEGER;

-- CreateTable
CREATE TABLE "shipping_rate_configs" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ratePerKg" DECIMAL(10,2) NOT NULL,
    "minCharge" DECIMAL(10,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_rate_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_rate_configs_category_isActive_idx" ON "shipping_rate_configs"("category", "isActive");
