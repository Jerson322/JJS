"use server";

import { z } from "zod";
import { prisma } from "@/server/db/client";
import { calculateShipping } from "@/server/services/shipping-calculator/calculator";

const inputSchema = z.object({
  weightGrams: z.coerce.number().positive(),
  category: z.string().min(1),
});

export interface EstimateShippingResult {
  data?: {
    shippingCost: number;
  };
  error?: string;
}

export async function estimateShippingAction(
  input: unknown,
): Promise<EstimateShippingResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Ingresa un peso y una categoría válidos." };
  }

  const rates = await prisma.shippingRateConfig.findMany({
    where: { isActive: true },
  });

  if (rates.length === 0) {
    return { error: "Todavía no hay tarifas de envío configuradas." };
  }

  try {
    const result = calculateShipping({
      weightGrams: parsed.data.weightGrams,
      category: parsed.data.category,
      rates: rates.map((rate) => ({
        category: rate.category,
        ratePerKg: Number(rate.ratePerKg),
        minCharge: rate.minCharge != null ? Number(rate.minCharge) : null,
      })),
    });

    return { data: { shippingCost: result.shippingCost } };
  } catch {
    return { error: "No pudimos calcular el envío para esa categoría." };
  }
}

export async function getShippingCategories(): Promise<string[]> {
  const rates = await prisma.shippingRateConfig.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  return rates.map((r) => r.category);
}
