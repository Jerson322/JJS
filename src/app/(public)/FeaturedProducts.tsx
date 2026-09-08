import Link from "next/link";
import { prisma } from "@/server/db/client";
import styles from "./home.module.css";

const CURATED_NAMES = [
  "iPhone 17 Pro Max",
  "MacBook Air 13-inch",
  "iPad Pro 11-inch",
  "Apple Watch Ultra 3",
  "AirPods Pro 3",
  "iMac 24-inch",
  "MacBook Pro 14-inch",
  "iPhone Air",
];

export async function FeaturedProducts() {
  const products = await prisma.catalogProduct.findMany({
    where: { name: { in: CURATED_NAMES }, isActive: true },
    include: {
      brand: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const ordered = CURATED_NAMES.map((name) =>
    products.find((p) => p.name === name),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (ordered.length === 0) return null;

  return (
    <section className={styles.featuredSection}>
      <div className={styles.categoryIntro}>
        <h2 className={styles.sectionTitle}>Lo más pedido ahora</h2>
        <p>Precios y disponibilidad directo de la tienda oficial.</p>
      </div>
      <div className={styles.featuredTrack}>
        {ordered.map((product) => {
          const hasVariants = product.variants.length > 0;
          const cover = hasVariants
            ? product.variants.find((v) => v.imageUrl)?.imageUrl
            : product.imageUrl;
          const prices = hasVariants
            ? product.variants
                .map((v) => (v.price != null ? Number(v.price) : null))
                .filter((p): p is number => p != null)
            : product.price != null
              ? [Number(product.price)]
              : [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : null;

          return (
            <Link
              key={product.id}
              href={`/catalogo/${product.brand.slug}/${product.id}`}
              className={styles.featuredCard}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={product.name} className={styles.featuredImage} />
              ) : (
                <div className={styles.featuredImagePlaceholder} />
              )}
              <div className={styles.featuredInfo}>
                <span className={styles.featuredBrand}>{product.brand.name}</span>
                <strong>{product.name}</strong>
                {minPrice != null && (
                  <span className={styles.featuredPrice}>
                    {hasVariants ? "Desde " : ""}${minPrice}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
