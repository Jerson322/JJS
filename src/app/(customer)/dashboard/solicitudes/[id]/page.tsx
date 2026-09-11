import { notFound } from "next/navigation";
import { STATUS_LABELS } from "@/lib/status-labels";
import { statusBadgeClass } from "@/lib/status-colors";
import { requireUser } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";

export default async function SolicitudDetailPage(
  props: PageProps<"/dashboard/solicitudes/[id]">,
) {
  const { id } = await props.params;
  const user = await requireUser();

  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      destinationAddress: true,
      quotes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!request || request.customerId !== user.id) {
    notFound();
  }

  return (
    <div className="container stack">
      <h1>{request.description}</h1>
      <span className={statusBadgeClass(request.status)}>
        {STATUS_LABELS[request.status]}
      </span>

      <div className="card stack">
        <h2>Detalle</h2>
        {request.imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={request.imageDataUrl}
            alt="Foto del producto solicitado"
            style={{
              maxWidth: 220,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          />
        )}
        {request.productUrl && (
          <p>
            Producto:{" "}
            <a href={request.productUrl} target="_blank" rel="noreferrer">
              {request.productUrl}
            </a>
          </p>
        )}
        <p>Cantidad: {request.quantity}</p>
        {request.estimatedDeclaredValue && (
          <p>
            Valor estimado: ${request.estimatedDeclaredValue.toString()}
          </p>
        )}
        {request.notes && <p>Notas: {request.notes}</p>}
      </div>

      <div className="card stack">
        <h2>Dirección de entrega</h2>
        <p>{request.destinationAddress.addressLine}</p>
        <p>
          {request.destinationAddress.city}
          {request.destinationAddress.state
            ? `, ${request.destinationAddress.state}`
            : ""}
          , {request.destinationAddress.country}
        </p>
        <p>Tel: {request.destinationAddress.phone}</p>
      </div>

      {request.quotes.length > 0 && (
        <div className="card stack">
          <h2>Cotización</h2>
          {request.quotes.map((quote) => (
            <div key={quote.id} className="stack">
              <p>Costo del producto: ${quote.itemCost.toString()}</p>
              <p>Comisión de servicio: ${quote.serviceFee.toString()}</p>
              <p>Envío internacional: ${quote.intlShippingCost.toString()}</p>
              <p>Aduana estimada: ${quote.estimatedDuty.toString()}</p>
              <p>
                <strong>Total: ${quote.totalAmount.toString()} {quote.currency}</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="card stack">
        <h2>Seguimiento</h2>
        <ul className="stack">
          {request.events.map((event) => (
            <li
              key={event.id}
              style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className={statusBadgeClass(event.toStatus)}>
                  {STATUS_LABELS[event.toStatus]}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {event.createdAt.toLocaleString("es-PA")}
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
