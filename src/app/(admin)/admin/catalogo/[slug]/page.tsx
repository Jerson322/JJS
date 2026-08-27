import { notFound } from "next/navigation";
import {
  deleteCatalogProductAction,
  toggleCatalogProductActiveAction,
} from "@/server/actions/catalog.actions";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { AddProductForm } from "./AddProductForm";

export default async function AdminCatalogoBrandPage(
  props: PageProps<"/admin/catalogo/[slug]">,
) {
  await requireRole(["STAFF", "ADMIN"]);
  const { slug } = await props.params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!brand) notFound();

  return (
    <div className="container stack">
      <h1>{brand.name} — Catálogo</h1>

      <AddProductForm brandId={brand.id} brandSlug={brand.slug} />

      <div className="stack">
        {brand.products.map((product) => {
          const deleteWithArgs = deleteCatalogProductAction.bind(
            null,
            product.id,
            brand.slug,
          );
          const toggleWithArgs = toggleCatalogProductActiveAction.bind(
            null,
            product.id,
            !product.isActive,
            brand.slug,
          );

          return (
            <div
              key={product.id}
              className="card"
              style={{ display: "flex", gap: "1rem", alignItems: "center" }}
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  style={{ objectFit: "contain" }}
                />
              )}
              <div style={{ flex: 1 }}>
                <strong>{product.name}</strong>
                {product.price != null && <div>${product.price.toString()}</div>}
                <span className="badge">
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <form action={toggleWithArgs}>
                <button className="button" type="submit">
                  {product.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={deleteWithArgs}>
                <button className="button" type="submit">
                  Eliminar
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
