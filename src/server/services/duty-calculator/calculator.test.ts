import { describe, expect, it } from "vitest";
import { calculateDuty, type DutyRateInput } from "./calculator";

const rates: DutyRateInput[] = [
  { category: "electronics", ratePercent: 15, minThreshold: 100, flatFee: 5 },
  { category: "clothing", ratePercent: 10, minThreshold: null, flatFee: null },
  { category: "general", ratePercent: 12, minThreshold: 0, flatFee: null },
];

describe("calculateDuty", () => {
  it("applies percent + flat fee when above the exemption threshold", () => {
    const result = calculateDuty({
      declaredValue: 200,
      category: "electronics",
      rates,
    });

    expect(result.exempt).toBe(false);
    expect(result.dutyAmount).toBe(35); // 200*0.15 + 5
    expect(result.applicableRate.category).toBe("electronics");
  });

  it("is exempt when declared value is at or below the threshold", () => {
    const result = calculateDuty({
      declaredValue: 100,
      category: "electronics",
      rates,
    });

    expect(result.exempt).toBe(true);
    expect(result.dutyAmount).toBe(0);
  });

  it("handles a category with no threshold or flat fee", () => {
    const result = calculateDuty({
      declaredValue: 50,
      category: "clothing",
      rates,
    });

    expect(result.exempt).toBe(false);
    expect(result.dutyAmount).toBe(5); // 50*0.10
  });

  it("falls back to the general category when the category is unknown", () => {
    const result = calculateDuty({
      declaredValue: 100,
      category: "unknown-category",
      rates,
    });

    expect(result.applicableRate.category).toBe("general");
    expect(result.dutyAmount).toBe(12); // 100*0.12
  });

  it("throws when neither the category nor a general fallback exists", () => {
    expect(() =>
      calculateDuty({
        declaredValue: 100,
        category: "unknown-category",
        rates: rates.filter((r) => r.category !== "general"),
      }),
    ).toThrow();
  });

  it("treats zero declared value as exempt when a zero threshold exists", () => {
    const result = calculateDuty({
      declaredValue: 0,
      category: "general",
      rates,
    });

    expect(result.exempt).toBe(true);
  });

  it("rounds the duty amount to 2 decimals", () => {
    const result = calculateDuty({
      declaredValue: 33.33,
      category: "clothing",
      rates,
    });

    expect(result.dutyAmount).toBe(3.33);
  });
});
