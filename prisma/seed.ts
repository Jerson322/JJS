import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@tienda.local" },
    update: {},
    create: {
      email: "admin@tienda.local",
      name: "Administrador",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.dutyRateConfig.upsert({
    where: { id: "seed-general" },
    update: {},
    create: {
      id: "seed-general",
      category: "general",
      ratePercent: 10,
      minThreshold: 100,
      flatFee: null,
    },
  });

  await prisma.dutyRateConfig.upsert({
    where: { id: "seed-electronics" },
    update: {},
    create: {
      id: "seed-electronics",
      category: "electronics",
      ratePercent: 15,
      minThreshold: 100,
      flatFee: 5,
    },
  });

  await prisma.shippingRateConfig.upsert({
    where: { id: "seed-shipping-general" },
    update: {},
    create: {
      id: "seed-shipping-general",
      category: "general",
      ratePerKg: 9,
      minCharge: 6,
    },
  });

  await prisma.shippingRateConfig.upsert({
    where: { id: "seed-shipping-electronics" },
    update: {},
    create: {
      id: "seed-shipping-electronics",
      category: "electronics",
      ratePerKg: 12,
      minCharge: 8,
    },
  });

  const brands = [
    {
      slug: "amazon",
      name: "Amazon",
      sortOrder: 1,
      products: [
        { name: "Echo Dot (5ta generación)", price: 49.99 },
        { name: "Kindle Paperwhite", price: 139.99 },
      ],
    },
    {
      slug: "apple",
      name: "Apple",
      sortOrder: 2,
      products: [
        { name: "iPhone 16", price: 799 },
        { name: "AirPods Pro 2", price: 249 },
      ],
    },
    {
      slug: "nike",
      name: "Nike",
      sortOrder: 3,
      products: [
        { name: "Air Force 1 '07", price: 115 },
        { name: "Nike Dunk Low", price: 110 },
      ],
    },
    {
      slug: "adidas",
      name: "Adidas",
      sortOrder: 4,
      products: [
        { name: "Samba OG", price: 100 },
        { name: "Ultraboost 22", price: 190 },
      ],
    },
    { slug: "samsung", name: "Samsung", sortOrder: 5, products: [] },
    { slug: "sony", name: "Sony", sortOrder: 6, products: [] },
    { slug: "new-balance", name: "New Balance", sortOrder: 7, products: [] },
    { slug: "under-armour", name: "Under Armour", sortOrder: 8, products: [] },
    { slug: "levis", name: "Levi's", sortOrder: 9, products: [] },
    { slug: "best-buy", name: "Best Buy", sortOrder: 10, products: [] },
  ];

  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, sortOrder: brand.sortOrder },
      create: {
        slug: brand.slug,
        name: brand.name,
        sortOrder: brand.sortOrder,
      },
    });

    for (const product of brand.products) {
      const existing = await prisma.catalogProduct.findFirst({
        where: { brandId: created.id, name: product.name },
      });
      if (!existing) {
        await prisma.catalogProduct.create({
          data: {
            brandId: created.id,
            name: product.name,
            price: product.price,
          },
        });
      }
    }
  }

  console.log("Seed completado. Admin: admin@tienda.local / Admin123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
