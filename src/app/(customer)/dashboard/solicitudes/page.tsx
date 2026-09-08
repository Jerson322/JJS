import Link from "next/link";
import { STATUS_LABELS } from "@/lib/status-labels";
import { statusBadgeClass } from "@/lib/status-colors";
import { requireUser } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

export default async function SolicitudesPage() {
  const user = await requireUser();

  const requests = await prisma.purchaseRequest.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container stack">
      <h1>Mis solicitudes</h1>

      {requests.length === 0 ? (
        <p className="card">
          Todavía no tienes solicitudes. <Link href="/solicitar">Crea la primera</Link>.
        </p>
      ) : (
        <div className="stack">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/solicitudes/${request.id}`}
              className="card"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <strong>{request.description}</strong>
                <span className={statusBadgeClass(request.status)}>
                  {STATUS_LABELS[request.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
