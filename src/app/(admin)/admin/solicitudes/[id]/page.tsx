import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABELS } from "@/lib/status-labels";
import { statusBadgeClass } from "@/lib/status-colors";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { AssignStaffForm } from "./AssignStaffForm";
import { StatusControl } from "./StatusControl";
import { QuoteForm } from "./QuoteForm";
import { PaymentSection } from "./PaymentSection";

export default async function AdminSolicitudDetailPage(
  props: PageProps<"/admin/solicitudes/[id]">,
) {
  await requireRole(["STAFF", "ADMIN"]);
  const { id } = await props.params;

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedStaff: true,
      destinationAddress: true,
      quotes: {
        orderBy: { createdAt: "desc" },
        include: { payments: true, createdByStaff: { select: { name: true } } },
      },
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!request) notFound();

  const staffUsers = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const latestQuote = request.quotes[0] ?? null;

  return (
    <div className="container stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <Link href="/admin/solicitudes" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            ← Todas las solicitudes
          </Link>
          <h1>{request.description}</h1>
        </div>
        <span className={statusBadgeClass(request.status)}>
          {STATUS_LABELS[request.status]}
        </span>
      </div>

      <div className="card stack">
        <h2>Cliente</h2>
        <p>
          {request.customer.name} · {request.customer.email}
          {request.customer.phone ? ` · ${request.customer.phone}` : ""}
        </p>
      </div>

      <div className="card stack">
        <h2>Detalle del producto</h2>
        {request.imageDataUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
            <a href={request.imageDataUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.imageDataUrl}
                alt="Foto del producto solicitado"
                style={{
                  maxWidth: 240,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  cursor: "zoom-in",
                }}
              />
            </a>
            <a
              href={request.imageDataUrl}
              download="foto-producto.jpg"
              className="button secondary"
              style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}
            >
              Descargar imagen
            </a>
          </div>
        )}
        {request.productUrl && (
          <p>
            Link: <a href={request.productUrl} target="_blank" rel="noreferrer">{request.productUrl}</a>
          </p>
        )}
        <p>Cantidad: {request.quantity}</p>
        {request.estimatedDeclaredValue && (
          <p>Valor declarado estimado: ${request.estimatedDeclaredValue.toString()}</p>
        )}
        {request.notes && <p>Notas: {request.notes}</p>}
      </div>

      <div className="card stack">
        <h2>Dirección de entrega</h2>
        <p>{request.destinationAddress.addressLine}</p>
        <p>
          {request.destinationAddress.city}
          {request.destinationAddress.state ? `, ${request.destinationAddress.state}` : ""}
          , {request.destinationAddress.country}
        </p>
        {request.destinationAddress.referencePoint && (
          <p>Referencia: {request.destinationAddress.referencePoint}</p>
        )}
        <p>Tel: {request.destinationAddress.phone}</p>
      </div>

      <div className="card stack">
        <h2>Asignación</h2>
        <AssignStaffForm
          requestId={request.id}
          staffUsers={staffUsers}
          currentStaffId={request.assignedStaffId}
        />
      </div>

      <div className="card stack">
        <h2>Estado</h2>
        <StatusControl requestId={request.id} currentStatus={request.status} />
      </div>

      <div className="card stack">
        <h2>Cotizaciones</h2>
        {request.quotes.length === 0 ? (
          <p>Todavía no hay cotizaciones.</p>
        ) : (
          <div className="stack">
            {request.quotes.map((quote) => (
              <div key={quote.id} className="card stack">
                <p>Costo del producto: ${quote.itemCost.toString()}</p>
                <p>Comisión de servicio: ${quote.serviceFee.toString()}</p>
                <p>Envío internacional: ${quote.intlShippingCost.toString()}</p>
                <p>Aduana estimada: ${quote.estimatedDuty.toString()}</p>
                <p>
                  <strong>Total: ${quote.totalAmount.toString()} {quote.currency}</strong>
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Creada por {quote.createdByStaff.name} el{" "}
                  {quote.createdAt.toLocaleString("es-PA")}
                </p>
              </div>
            ))}
          </div>
        )}
        <QuoteForm requestId={request.id} currentStatus={request.status} />
      </div>

      <div className="card stack">
        <h2>Pagos</h2>
        <PaymentSection
          requestId={request.id}
          currentStatus={request.status}
          latestQuote={
            latestQuote
              ? { id: latestQuote.id, totalAmount: Number(latestQuote.totalAmount), currency: latestQuote.currency }
              : null
          }
          payments={request.quotes.flatMap((q) =>
            q.payments.map((p) => ({
              id: p.id,
              amount: Number(p.amount),
              provider: p.provider,
              providerRef: p.providerRef,
              proofOfPaymentUrl: p.proofOfPaymentUrl,
              status: p.status,
              createdAt: p.createdAt.toISOString(),
            })),
          )}
        />
      </div>

      <div className="card stack">
        <h2>Seguimiento</h2>
        <ul className="stack">
          {request.events.map((event) => (
            <li key={event.id} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <span className={statusBadgeClass(event.toStatus)}>
                  {STATUS_LABELS[event.toStatus]}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {event.createdAt.toLocaleString("es-PA")}
                  {event.actor ? ` · ${event.actor.name}` : ""}
                </span>
              </div>
              {event.note && <div>{event.note}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
