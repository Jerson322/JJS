import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { ProductDetail } from "../ProductDetail";
import styles from "../catalogo.module.css";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage(
  props: PageProps<"/catalogo/[slug]/[productId]">,
) {
  const { slug, productId } = await props.params;

  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand || !brand.isActive) notFound();

  const product = await prisma.catalogProduct.findFirst({
    where: { id: productId, brandId: brand.id, isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!product) notFound();

  const variants =
    product.variants.length > 0
      ? product.variants.map((v) => ({
          id: v.id,
          capacity: v.capacity,
          color: v.color,
          price: v.price != null ? Number(v.price) : null,
          images: v.images,
          productUrl: v.productUrl,
        }))
      : [
          {
            id: product.id,
            capacity: null,
            color: null,
            price: product.price != null ? Number(product.price) : null,
            images: product.images,
            productUrl: product.productUrl,
          },
        ];

  return (
    <div className="container stack">
      <div className={styles.header}>
        <Link href={`/catalogo/${brand.slug}`}>← Volver a {brand.name}</Link>
      </div>

      <ProductDetail
        productName={product.name}
        description={product.description}
        brandName={brand.name}
        variants={variants}
      />
    </div>
  );
}
