"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { RequestStatus } from "@/generated/prisma/enums";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db/client";
import { calculateDuty } from "@/server/services/duty-calculator/calculator";
import { canTransition } from "@/server/services/status-machine/transitions";
import { transitionStatus } from "@/server/services/status-machine/transition-status";

function path(id: string) {
  return `/admin/solicitudes/${id}`;
}

export async function assignStaffAction(formData: FormData): Promise<void> {
  await requireRole(["STAFF", "ADMIN"]);

  const requestId = String(formData.get("requestId"));
  const staffUserId = String(formData.get("staffUserId") || "");

  await prisma.purchaseRequest.update({
    where: { id: requestId },
    data: { assignedStaffId: staffUserId || null },
  });

  revalidatePath(path(requestId));
  revalidatePath("/admin/solicitudes");
}

export interface TransitionStatusState {
  error?: string;
}

export async function transitionRequestStatusAction(
  _prevState: TransitionStatusState,
  formData: FormData,
): Promise<TransitionStatusState> {
  const staff = await requireRole(["STAFF", "ADMIN"]);

  const requestId = String(formData.get("requestId"));
  const to = String(formData.get("to")) as RequestStatus;
  const note = String(formData.get("note") || "").trim() || undefined;

  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    select: { status: true },
  });
  if (!request) return { error: "Solicitud no encontrada." };

  if (!canTransition(request.status, to)) {
    return {
      error: `No se puede pasar de ${request.status} a ${to}.`,
    };
  }

  try {
    await transitionStatus({
      purchaseRequestId: requestId,
      from: request.status,
      to,
      actorUserId: staff.id,
      note,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo cambiar el estado.",
    };
  }

  revalidatePath(path(requestId));
  revalidatePath("/admin/solicitudes");
  return {};
}

const createQuoteSchema = z.object({
  requestId: z.string().min(1),
  itemCost: z.coerce.number().min(0),
  serviceFee: z.coerce.number().min(0),
  intlShippingCost: z.coerce.number().min(0),
  estimatedDuty: z.coerce.number().min(0),
  currency: z.string().min(1).default("USD"),
});

export interface CreateQuoteState {
  error?: string;
}

export async function createQuoteAction(
  _prevState: CreateQuoteState,
  formData: FormData,
): Promise<CreateQuoteState> {
  const staff = await requireRole(["STAFF", "ADMIN"]);

  const parsed = createQuoteSchema.safeParse({
    requestId: formData.get("requestId"),
    itemCost: formData.get("itemCost"),
    serviceFee: formData.get("serviceFee"),
    intlShippingCost: formData.get("intlShippingCost"),
    estimatedDuty: formData.get("estimatedDuty"),
    currency: formData.get("currency") || "USD",
  });

  if (!parsed.success) {
    return { error: "Revisa los montos de la cotización." };
  }

  const { requestId, itemCost, serviceFee, intlShippingCost, estimatedDuty, currency } =
    parsed.data;

  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    select: { status: true },
  });
  if (!request) return { error: "Solicitud no encontrada." };
  if (!canTransition(request.status, "QUOTED")) {
    return {
      error: `La solicitud está en estado ${request.status} y no admite una nueva cotización directamente.`,
    };
  }

  const totalAmount = itemCost + serviceFee + intlShippingCost + estimatedDuty;

  await prisma.$transaction(async (tx) => {
    await tx.quote.create({
      data: {
        purchaseRequestId: requestId,
        itemCost,
        serviceFee,
        intlShippingCost,
        estimatedDuty,
        totalAmount,
        currency,
        dutyCalcSnapshot: { estimatedDuty, itemCost, currency },
        createdByStaffId: staff.id,
      },
    });

    await transitionStatus(
      {
        purchaseRequestId: requestId,
        from: request.status,
        to: "QUOTED",
        actorUserId: staff.id,
        note: "Cotización creada.",
      },
      tx,
    );
  });

  revalidatePath(path(requestId));
  revalidatePath("/admin/solicitudes");
  return {};
}

const estimateDutySchema = z.object({
  declaredValue: z.coerce.number().positive(),
  category: z.string().min(1),
});

export interface EstimateDutyForQuoteResult {
  data?: { dutyAmount: number };
  error?: string;
}

// Lets staff pre-fill the "arancel estimado" field of the quote form using
// the same duty configuration customers see in the public calculator.
export async function estimateDutyForQuoteAction(
  input: unknown,
): Promise<EstimateDutyForQuoteResult> {
  await requireRole(["STAFF", "ADMIN"]);

  const parsed = estimateDutySchema.safeParse(input);
  if (!parsed.success) return { error: "Ingresa un valor y categoría válidos." };

  const rates = await prisma.dutyRateConfig.findMany({ where: { isActive: true } });
  if (rates.length === 0) return { error: "No hay tarifas de aduana configuradas." };

  try {
    const result = calculateDuty({
      declaredValue: parsed.data.declaredValue,
      category: parsed.data.category,
      rates: rates.map((r) => ({
        category: r.category,
        ratePercent: Number(r.ratePercent),
        minThreshold: r.minThreshold != null ? Number(r.minThreshold) : null,
        flatFee: r.flatFee != null ? Number(r.flatFee) : null,
      })),
    });
    return { data: { dutyAmount: result.dutyAmount } };
  } catch {
    return { error: "No pudimos calcular el estimado." };
  }
}

const recordPaymentSchema = z.object({
  requestId: z.string().min(1),
  quoteId: z.string().min(1),
  amount: z.coerce.number().positive(),
  provider: z.string().min(1),
  providerRef: z.string().optional(),
  proofOfPaymentUrl: z.string().url().optional().or(z.literal("")),
});

export interface RecordPaymentState {
  error?: string;
}

export async function recordPaymentAction(
  _prevState: RecordPaymentState,
  formData: FormData,
): Promise<RecordPaymentState> {
  await requireRole(["STAFF", "ADMIN"]);

  const parsed = recordPaymentSchema.safeParse({
    requestId: formData.get("requestId"),
    quoteId: formData.get("quoteId"),
    amount: formData.get("amount"),
    provider: formData.get("provider"),
    providerRef: formData.get("providerRef") || undefined,
    proofOfPaymentUrl: formData.get("proofOfPaymentUrl") || "",
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del pago." };
  }

  await prisma.payment.create({
    data: {
      purchaseRequestId: parsed.data.requestId,
      quoteId: parsed.data.quoteId,
      amount: parsed.data.amount,
      provider: parsed.data.provider,
      providerRef: parsed.data.providerRef,
      proofOfPaymentUrl: parsed.data.proofOfPaymentUrl || null,
      status: "PENDING",
    },
  });

  revalidatePath(path(parsed.data.requestId));
  return {};
}

export async function confirmPaymentAction(
  paymentId: string,
  requestId: string,
): Promise<void> {
  const staff = await requireRole(["STAFF", "ADMIN"]);

  const request = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    select: { status: true },
  });
  if (!request) throw new Error("Solicitud no encontrada.");

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "CONFIRMED", confirmedByStaffId: staff.id },
    });

    if (canTransition(request.status, "PAID")) {
      await transitionStatus(
        {
          purchaseRequestId: requestId,
          from: request.status,
          to: "PAID",
          actorUserId: staff.id,
          note: "Pago confirmado.",
        },
        tx,
      );
    }
  });

  revalidatePath(path(requestId));
  revalidatePath("/admin/solicitudes");
}
