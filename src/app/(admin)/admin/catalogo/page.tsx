import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

export default async function AdminCatalogoPage() {
  await requireRole(["STAFF", "ADMIN"]);

  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container stack">
      <h1>Catálogo por marca</h1>
      <p>Elige una marca para ver y agregar productos.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/admin/catalogo/${brand.slug}`}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            <strong>{brand.name}</strong>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {brand._count.products} producto(s)
            </span>
            <span
              className={`badge ${brand.isActive ? "badge-success" : "badge-neutral"}`}
              style={{ alignSelf: "flex-start", marginTop: "0.4rem" }}
            >
              {brand.isActive ? "Activa" : "Inactiva"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
