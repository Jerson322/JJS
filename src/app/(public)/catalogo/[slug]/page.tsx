import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { ProductVariantCard } from "./ProductVariantCard";
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
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!brand || !brand.isActive) {
    notFound();
  }

  return (
    <div className="container stack">
      <div className={styles.header}>
        <Link href="/">← Volver</Link>
        <h1>{brand.name}</h1>
        <p>Elige un producto para solicitar su importación.</p>
      </div>

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
          {brand.products.map((product) =>
            product.variants.length > 0 ? (
              <ProductVariantCard
                key={product.id}
                productName={product.name}
                brandName={brand.name}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  capacity: v.capacity,
                  color: v.color,
                  price: v.price != null ? Number(v.price) : null,
                  images: v.images,
                  productUrl: v.productUrl,
                }))}
              />
            ) : (
              <div key={product.id} className={styles.productCard}>
                {product.images.length > 0 ? (
                  <ProductImageCarousel images={product.images} alt={product.name} />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    {brand.name}
                  </div>
                )}
                <strong>{product.name}</strong>
                {product.price != null && (
                  <span className={styles.productPrice}>
                    ${product.price.toString()}
                  </span>
                )}
                <Link
                  href={`/solicitar?prefill=${encodeURIComponent(
                    product.productUrl || `${product.name} (${brand.name})`,
                  )}`}
                  className="button"
                >
                  Solicitar este producto
                </Link>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
