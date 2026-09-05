-- AlterTable
ALTER TABLE "catalog_products" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
