import type { RequestStatus } from "@/generated/prisma/enums";

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["QUOTED", "CANCELLED"],
  QUOTED: ["AWAITING_PAYMENT", "QUOTE_REJECTED", "CANCELLED"],
  QUOTE_REJECTED: ["UNDER_REVIEW", "CANCELLED"],
  AWAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PURCHASED", "CANCELLED"],
  PURCHASED: ["SHIPPED_TO_WAREHOUSE"],
  SHIPPED_TO_WAREHOUSE: ["IN_TRANSIT_INTL"],
  IN_TRANSIT_INTL: ["IN_CUSTOMS"],
  IN_CUSTOMS: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: RequestStatus, to: RequestStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transición de estado inválida: ${from} -> ${to}`);
  }
}
