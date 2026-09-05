export interface ShippingRateInput {
  category: string;
  ratePerKg: number;
  minCharge: number | null;
}

export interface ShippingCalcInput {
  weightGrams: number;
  category: string;
  rates: ShippingRateInput[];
}

export interface ShippingCalcResult {
  applicableRate: ShippingRateInput;
  shippingCost: number;
  breakdown: {
    weightKg: number;
    ratePerKg: number;
    minCharge: number;
  };
}

const FALLBACK_CATEGORY = "general";

export function calculateShipping(input: ShippingCalcInput): ShippingCalcResult {
  const rate =
    input.rates.find((r) => r.category === input.category) ??
    input.rates.find((r) => r.category === FALLBACK_CATEGORY);

  if (!rate) {
    throw new Error(
      `No hay tarifa de envío configurada para la categoría "${input.category}" ni una categoría "${FALLBACK_CATEGORY}" de respaldo.`,
    );
  }

  const weightKg = input.weightGrams / 1000;
  const minCharge = rate.minCharge ?? 0;
  const shippingCost = round2(Math.max(weightKg * rate.ratePerKg, minCharge));

  return {
    applicableRate: rate,
    shippingCost,
    breakdown: {
      weightKg,
      ratePerKg: rate.ratePerKg,
      minCharge,
    },
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
