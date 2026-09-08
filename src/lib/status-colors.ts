import type { RequestStatus } from "@/generated/prisma/enums";

type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger";

export const STATUS_BADGE_VARIANT: Record<RequestStatus, BadgeVariant> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "info",
  QUOTED: "info",
  QUOTE_REJECTED: "danger",
  AWAITING_PAYMENT: "warning",
  PAID: "info",
  PURCHASED: "info",
  SHIPPED_TO_WAREHOUSE: "info",
  IN_TRANSIT_INTL: "info",
  IN_CUSTOMS: "warning",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export function statusBadgeClass(status: RequestStatus): string {
  return `badge badge-${STATUS_BADGE_VARIANT[status]}`;
}
