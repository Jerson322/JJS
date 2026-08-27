"use server";

import { z } from "zod";
import { prisma } from "@/server/db/client";
import { calculateDuty } from "@/server/services/duty-calculator/calculator";

const inputSchema = z.object({
  declaredValue: z.coerce.number().positive(),
  category: z.string().min(1),
});

export interface EstimateDutyResult {
  data?: {
    dutyAmount: number;
    exempt: boolean;
    total: number;
  };
  error?: string;
}

export async function estimateDutyAction(
  input: unknown,
): Promise<EstimateDutyResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Ingresa un valor y una categoría válidos." };
  }

  const rates = await prisma.dutyRateConfig.findMany({
    where: { isActive: true },
  });

  if (rates.length === 0) {
    return { error: "Todavía no hay tarifas de aduana configuradas." };
  }

  try {
    const result = calculateDuty({
      declaredValue: parsed.data.declaredValue,
      category: parsed.data.category,
      rates: rates.map((rate) => ({
        category: rate.category,
        ratePercent: Number(rate.ratePercent),
        minThreshold: rate.minThreshold != null ? Number(rate.minThreshold) : null,
        flatFee: rate.flatFee != null ? Number(rate.flatFee) : null,
      })),
    });

    return {
      data: {
        dutyAmount: result.dutyAmount,
        exempt: result.exempt,
        total: parsed.data.declaredValue + result.dutyAmount,
      },
    };
  } catch {
    return { error: "No pudimos calcular el estimado para esa categoría." };
  }
}

export async function getDutyCategories(): Promise<string[]> {
  const rates = await prisma.dutyRateConfig.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  return rates.map((r) => r.category);
}
