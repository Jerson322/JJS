import Link from "next/link";
import { STATUS_LABELS } from "@/lib/status-labels";
import { statusBadgeClass } from "@/lib/status-colors";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import type { RequestStatus } from "@/generated/prisma/enums";

const STATUS_FILTERS: { value: RequestStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "SUBMITTED", label: "Enviadas" },
  { value: "UNDER_REVIEW", label: "En revisión" },
  { value: "QUOTED", label: "Cotizadas" },
  { value: "AWAITING_PAYMENT", label: "Esperando pago" },
  { value: "PAID", label: "Pagadas" },
  { value: "PURCHASED", label: "Compradas" },
  { value: "SHIPPED_TO_WAREHOUSE", label: "En bodega" },
  { value: "IN_TRANSIT_INTL", label: "En tránsito" },
  { value: "IN_CUSTOMS", label: "En aduana" },
  { value: "OUT_FOR_DELIVERY", label: "En reparto" },
  { value: "DELIVERED", label: "Entregadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

export default async function AdminSolicitudesPage(
  props: PageProps<"/admin/solicitudes">,
) {
  await requireRole(["STAFF", "ADMIN"]);
  const searchParams = await props.searchParams;
  const statusParam = searchParams.status;
  const status = Array.isArray(statusParam) ? statusParam[0] : statusParam;

  const [requests, counts] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where: status && status !== "ALL" ? { status: status as RequestStatus } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        assignedStaff: { select: { name: true } },
      },
      take: 100,
    }),
    prisma.purchaseRequest.groupBy({ by: ["status"], _count: true }),
  ]);

  const countByStatus = new Map(counts.map((c) => [c.status, c._count]));

  return (
    <div className="container stack">
      <h1>Solicitudes</h1>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((filter) => {
          const count =
            filter.value === "ALL"
              ? undefined
              : countByStatus.get(filter.value as RequestStatus);
          const isActive = (status ?? "ALL") === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value === "ALL" ? "/admin/solicitudes" : `/admin/solicitudes?status=${filter.value}`}
              className="badge"
              style={{
                background: isActive ? "var(--accent)" : undefined,
                color: isActive ? "#fff" : undefined,
              }}
            >
              {filter.label}
              {count != null && count > 0 ? ` (${count})` : ""}
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <p className="card">No hay solicitudes con ese filtro.</p>
      ) : (
        <div className="stack">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/solicitudes/${request.id}`}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <strong>{request.description}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {request.customer.name} · {request.customer.email}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {request.createdAt.toLocaleDateString("es-PA")} ·{" "}
                  {request.assignedStaff
                    ? `Asignada a ${request.assignedStaff.name}`
                    : "Sin asignar"}
                </div>
              </div>
              <span className={statusBadgeClass(request.status)}>
                {STATUS_LABELS[request.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
