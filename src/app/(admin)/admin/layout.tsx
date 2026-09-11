import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole(["STAFF", "ADMIN"]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        <Link href="/admin/solicitudes">Solicitudes</Link>
        <Link href="/admin/catalogo">Catálogo</Link>
      </div>
      {children}
    </div>
  );
}
