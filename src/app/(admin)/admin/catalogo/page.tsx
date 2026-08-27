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

      <div className="stack">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/admin/catalogo/${brand.slug}`} className="card">
            <strong>{brand.name}</strong> — {brand._count.products} producto(s)
          </Link>
        ))}
      </div>
    </div>
  );
}
