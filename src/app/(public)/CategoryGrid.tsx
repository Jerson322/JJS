import Link from "next/link";
import { prisma } from "@/server/db/client";
import { Reveal } from "@/components/Reveal";
import styles from "./home.module.css";

const BRAND_COLORS: Record<string, string> = {
  amazon: "#232f3e",
  apple: "#1d1d1f",
  nike: "#111111",
  adidas: "#111111",
  samsung: "#1428a0",
  sony: "#000000",
  "new-balance": "#cc0000",
  "under-armour": "#0c0c0c",
  levis: "#d1282e",
  "best-buy": "#0046be",
};

export async function CategoryGrid() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          imageUrl: true,
          variants: {
            where: { isActive: true, imageUrl: { not: null } },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
      _count: { select: { products: true } },
    },
  });

  if (brands.length === 0) return null;

  return (
    <section className={styles.categorySection}>
      <Reveal className={styles.categoryIntro}>
        <h2 className={styles.sectionTitle}>Compra tus marcas favoritas</h2>
        <p>Elige una marca y arma tu pedido con nuestra ayuda.</p>
      </Reveal>
      <div className={styles.categoryGrid}>
        {brands.map((brand, index) => {
          const product = brand.products[0];
          const image = product?.variants[0]?.imageUrl ?? product?.imageUrl ?? null;

          return (
            <Reveal key={brand.id} delay={index * 0.07}>
              <Link
                href={`/catalogo/${brand.slug}`}
                className={styles.categoryTile}
                style={{ background: BRAND_COLORS[brand.slug] ?? "#374151" }}
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className={styles.categoryImage} />
                )}
                <div className={styles.categoryOverlay} />
                <div className={styles.categoryLabel}>
                  <strong>{brand.name}</strong>
                  <span>
                    {brand._count.products > 0
                      ? "Ver catálogo →"
                      : "Solicitar producto →"}
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
