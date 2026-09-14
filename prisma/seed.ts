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

  const nikeShortcuts = [
    {
      label: "SHOES",
      url: "https://www.nike.com/w/shoes-20db4z38l5kzy7ok",
      keywords: ["zapatillas", "zapatos", "shoes", "tenis", "calzado", "nike zapatillas", "nike zapatos"],
      sortOrder: 0,
    },
    {
      label: "AIR FORCE 1",
      url: "https://www.nike.com/w/air-force-1-shoes-1kf3iz38l5kz5sj3yzy7ok",
      keywords: ["air force 1", "air force one", "airforce 1", "af1", "zapatillas air force", "nike air force"],
      sortOrder: 1,
    },
    {
      label: "AIR MAX",
      url: "https://www.nike.com/w/air-max-shoes-a6d8hzv660zvyaizy7ok",
      keywords: ["air max", "airmax", "zapatillas air max", "nike air max"],
      sortOrder: 2,
    },
    {
      label: "DUNK",
      url: "https://www.nike.com/w/dunk-1v79xz90aoh",
      keywords: ["dunk", "dunks", "nike dunk", "zapatillas dunk"],
      sortOrder: 3,
    },
    {
      label: "VOMERO",
      url: "https://www.nike.com/w/zoom-vomero-shoes-13jrmz7gee1zxw4hzy7ok",
      keywords: ["vomero", "zoom vomero", "nike vomero", "zapatillas vomero"],
      sortOrder: 4,
    },
    {
      label: "PEGASUS",
      url: "https://www.nike.com/w/nike-pegasus-4heq9z7yfbz8nexh",
      keywords: ["pegasus", "nike pegasus", "zapatillas pegasus", "air zoom pegasus"],
      sortOrder: 5,
    },
    {
      label: "P-6000",
      url: "https://www.nike.com/w/nike-p-6000-shoes-4ff6cz77wv6z8nb9wzy7ok",
      keywords: ["p6000", "p-6000", "nike p6000", "zapatillas p6000"],
      sortOrder: 6,
    },
    {
      label: "CORTEZ",
      url: "https://www.nike.com/w/cortez-byfx",
      keywords: ["cortez", "nike cortez", "zapatillas cortez"],
      sortOrder: 7,
    },
    {
      label: "SHOX",
      url: "https://www.nike.com/w/shox-13jrmz58jtoz7e8jq",
      keywords: ["shox", "nike shox", "zapatillas shox"],
      sortOrder: 8,
    },
    {
      label: "FREE RN",
      url: "https://www.nike.com/w/free-rn-5e1x6z9w4ggznik1",
      keywords: ["free rn", "nike free", "free run", "zapatillas free rn"],
      sortOrder: 9,
    },
    {
      label: "METCON",
      url: "https://www.nike.com/w/metcon-3yxqs",
      keywords: ["metcon", "nike metcon", "zapatillas metcon", "entrenamiento metcon"],
      sortOrder: 10,
    },
    {
      label: "ALPHAFLY",
      url: "https://www.nike.com/w/road-nike-alphafly-running-shoes-1tp17z37v7jz8kwewzy7ok",
      keywords: ["alphafly", "nike alphafly", "alphafly running", "zapatillas alphafly"],
      sortOrder: 11,
    },
    {
      label: "ROAD RACING",
      url: "https://www.nike.com/w/road-racing-shoes-9gdhkzy7ok/",
      keywords: ["road racing", "running de carretera", "zapatillas running", "running shoes"],
      sortOrder: 12,
    },
  ];

  for (const shortcut of nikeShortcuts) {
    const existing = await prisma.searchShortcut.findFirst({
      where: { url: shortcut.url },
    });
    if (!existing) {
      await prisma.searchShortcut.create({
        data: { brandLabel: "Nike", ...shortcut },
      });
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
