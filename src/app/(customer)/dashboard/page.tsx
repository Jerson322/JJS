import Link from "next/link";
import { requireUser } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

export default async function DashboardPage() {
  const user = await requireUser();

  const [total, active, delivered] = await Promise.all([
    prisma.purchaseRequest.count({ where: { customerId: user.id } }),
    prisma.purchaseRequest.count({
      where: {
        customerId: user.id,
        status: { notIn: ["DELIVERED", "CANCELLED", "QUOTE_REJECTED"] },
      },
    }),
    prisma.purchaseRequest.count({
      where: { customerId: user.id, status: "DELIVERED" },
    }),
  ]);

  return (
    <div className="container stack">
      <h1>Hola, {user.name}</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="card">
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Solicitudes totales
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 600 }}>{total}</div>
        </div>
        <div className="card">
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            En proceso
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--accent)" }}>
            {active}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Entregadas
          </span>
          <div style={{ fontSize: "1.8rem", fontWeight: 600, color: "var(--success)" }}>
            {delivered}
          </div>
        </div>
      </div>

      <div className="card stack">
        <p>Aquí puedes ver tus solicitudes de importación y su estado.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/dashboard/solicitudes" className="button">
            Ver mis solicitudes
          </Link>
          <Link href="/solicitar" className="button secondary">
            Nueva solicitud
          </Link>
        </div>
      </div>
    </div>
  );
}
