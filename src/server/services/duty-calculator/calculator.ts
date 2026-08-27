export interface DutyRateInput {
  category: string;
  ratePercent: number;
  minThreshold: number | null;
  flatFee: number | null;
}

export interface DutyCalcInput {
  declaredValue: number;
  category: string;
  rates: DutyRateInput[];
}

export interface DutyCalcResult {
  applicableRate: DutyRateInput;
  dutyAmount: number;
  exempt: boolean;
  breakdown: {
    base: number;
    ratePercent: number;
    flatFee: number;
  };
}

const FALLBACK_CATEGORY = "general";

export function calculateDuty(input: DutyCalcInput): DutyCalcResult {
  const rate =
    input.rates.find((r) => r.category === input.category) ??
    input.rates.find((r) => r.category === FALLBACK_CATEGORY);

  if (!rate) {
    throw new Error(
      `No hay tasa de aduana configurada para la categoría "${input.category}" ni una categoría "${FALLBACK_CATEGORY}" de respaldo.`,
    );
  }

  const exempt =
    rate.minThreshold != null && input.declaredValue <= rate.minThreshold;

  if (exempt) {
    return {
      applicableRate: rate,
      dutyAmount: 0,
      exempt: true,
      breakdown: { base: input.declaredValue, ratePercent: 0, flatFee: 0 },
    };
  }

  const flatFee = rate.flatFee ?? 0;
  const percentAmount = (input.declaredValue * rate.ratePercent) / 100;
  const dutyAmount = round2(percentAmount + flatFee);

  return {
    applicableRate: rate,
    dutyAmount,
    exempt: false,
    breakdown: {
      base: input.declaredValue,
      ratePercent: rate.ratePercent,
      flatFee,
    },
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
