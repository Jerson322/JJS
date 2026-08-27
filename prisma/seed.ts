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
