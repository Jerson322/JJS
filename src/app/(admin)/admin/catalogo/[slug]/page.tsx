import { notFound } from "next/navigation";
import {
  deleteCatalogProductAction,
  deleteCatalogVariantAction,
  toggleCatalogProductActiveAction,
  toggleCatalogVariantActiveAction,
} from "@/server/actions/catalog.actions";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { AddProductForm } from "./AddProductForm";
import { AddVariantForm } from "./AddVariantForm";

export default async function AdminCatalogoBrandPage(
  props: PageProps<"/admin/catalogo/[slug]">,
) {
  await requireRole(["STAFF", "ADMIN"]);
  const { slug } = await props.params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { variants: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      },
    },
  });

  if (!brand) notFound();

  return (
    <div className="container stack">
      <h1>{brand.name} — Catálogo</h1>

      <AddProductForm brandId={brand.id} brandSlug={brand.slug} />

      <div className="stack">
        {brand.products.map((product) => {
          const deleteProductWithArgs = deleteCatalogProductAction.bind(
            null,
            product.id,
            brand.slug,
          );
          const toggleProductWithArgs = toggleCatalogProductActiveAction.bind(
            null,
            product.id,
            !product.isActive,
            brand.slug,
          );

          return (
            <div key={product.id} className="card stack">
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {product.imageUrl && (
                  <div style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt=""
                      width={64}
                      height={64}
                      style={{ objectFit: "contain" }}
                    />
                    {product.images.length > 1 && (
                      <span
                        className="badge"
                        style={{ position: "absolute", bottom: -4, right: -4 }}
                      >
                        +{product.images.length - 1}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <strong>{product.name}</strong>
                  {product.variants.length === 0 && product.price != null && (
                    <div>${product.price.toString()}</div>
                  )}
                  {product.variants.length > 0 && (
                    <div>{product.variants.length} variante(s)</div>
                  )}
                  <span className="badge">
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <form action={toggleProductWithArgs}>
                  <button className="button" type="submit">
                    {product.isActive ? "Desactivar" : "Activar"}
                  </button>
                </form>
                <form action={deleteProductWithArgs}>
                  <button className="button" type="submit">
                    Eliminar
                  </button>
                </form>
              </div>

              {product.variants.length > 0 && (
                <div className="stack" style={{ paddingLeft: "1rem" }}>
                  {product.variants.map((variant) => {
                    const deleteVariantWithArgs = deleteCatalogVariantAction.bind(
                      null,
                      variant.id,
                      brand.slug,
                    );
                    const toggleVariantWithArgs = toggleCatalogVariantActiveAction.bind(
                      null,
                      variant.id,
                      !variant.isActive,
                      brand.slug,
                    );

                    return (
                      <div
                        key={variant.id}
                        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                      >
                        {variant.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variant.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            style={{ objectFit: "contain" }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          {[variant.capacity, variant.color].filter(Boolean).join(" - ") ||
                            "(sin especificar)"}
                          {variant.price != null && ` — $${variant.price.toString()}`}
                          {!variant.isActive && (
                            <span className="badge" style={{ marginLeft: "0.5rem" }}>
                              Inactivo
                            </span>
                          )}
                        </div>
                        <form action={toggleVariantWithArgs}>
                          <button className="button" type="submit">
                            {variant.isActive ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                        <form action={deleteVariantWithArgs}>
                          <button className="button" type="submit">
                            Eliminar
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}

              <AddVariantForm productId={product.id} brandSlug={brand.slug} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
