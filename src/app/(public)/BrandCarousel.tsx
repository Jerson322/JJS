import Link from "next/link";
import { prisma } from "@/server/db/client";
import styles from "./home.module.css";

const BRAND_COLORS: Record<string, string> = {
  amazon: "#232f3e",
  apple: "#111111",
  nike: "#111111",
  adidas: "#111111",
  samsung: "#1428a0",
  sony: "#000000",
  "new-balance": "#cc0000",
  "under-armour": "#0c0c0c",
  levis: "#d1282e",
  "best-buy": "#0046be",
};

export async function BrandCarousel() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (brands.length === 0) return null;

  return (
    <section className={styles.brandsSection}>
      <h2 className={styles.brandsTitle}>Compra de tus marcas favoritas</h2>
      <div className={styles.brandsTrack}>
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/catalogo/${brand.slug}`}
            className={styles.brandCard}
            style={{ background: BRAND_COLORS[brand.slug] ?? "#374151" }}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
