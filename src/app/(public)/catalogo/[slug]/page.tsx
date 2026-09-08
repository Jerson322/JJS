import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import styles from "./catalogo.module.css";

// Sin llamadas a APIs dinamicas (cookies/headers), Next la trataria como
// estatica y la congelaria con los productos de la primera visita.
export const dynamic = "force-dynamic";

export default async function CatalogoBrandPage(
  props: PageProps<"/catalogo/[slug]">,
) {
  const { slug } = await props.params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            where: { isActive: true },
            select: { imageUrl: true, price: true },
          },
        },
      },
    },
  });

  if (!brand || !brand.isActive) {
    notFound();
  }

  return (
    <div className={styles.brandPage}>
      <div className={styles.brandHero}>
        <div className={styles.breadcrumb}>
          <Link href="/">Inicio</Link>
          <span>/</span>
          <span>{brand.name}</span>
        </div>
        <h1>{brand.name}</h1>
        <p>Elige un producto para ver detalles y solicitar su importación.</p>
      </div>

      <div className="container">
        {brand.products.length === 0 ? (
          <p className="card">
            Todavía no tenemos productos cargados de {brand.name}. {" "}
            <Link
              href={`/solicitar?prefill=${encodeURIComponent(`Producto de ${brand.name}: `)}`}
            >
              Pide directamente el que quieres
            </Link>
            .
          </p>
        ) : (
          <div className={styles.grid}>
            {brand.products.map((product) => {
              const hasVariants = product.variants.length > 0;
              const coverImage = hasVariants
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
                  href={`/catalogo/${brand.slug}/${product.id}`}
                  className={styles.referenceCard}
                >
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt={product.name}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.productImagePlaceholder}>
                      {brand.name}
                    </div>
                  )}
                  <div className={styles.referenceInfo}>
                    <strong className={styles.productName} title={product.name}>
                      {product.name}
                    </strong>
                    {minPrice != null && (
                      <span className={styles.productPrice}>
                        {hasVariants ? "Desde " : ""}${minPrice}
                      </span>
                    )}
                    <span className={styles.referenceCta}>Ver detalles →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
