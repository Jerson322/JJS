import type { RequestStatus } from "@/generated/prisma/enums";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: "Enviada",
  UNDER_REVIEW: "En revisión",
  QUOTED: "Cotizada",
  QUOTE_REJECTED: "Cotización rechazada",
  AWAITING_PAYMENT: "Esperando pago",
  PAID: "Pagada",
  PURCHASED: "Comprada",
  SHIPPED_TO_WAREHOUSE: "En bodega de origen",
  IN_TRANSIT_INTL: "En tránsito internacional",
  IN_CUSTOMS: "En aduana",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};
