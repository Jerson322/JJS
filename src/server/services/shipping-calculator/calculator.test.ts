import { describe, expect, it } from "vitest";
import { calculateShipping, type ShippingRateInput } from "./calculator";

const rates: ShippingRateInput[] = [
  { category: "electronics", ratePerKg: 14, minCharge: 10 },
  { category: "clothing", ratePerKg: 8, minCharge: null },
  { category: "general", ratePerKg: 10, minCharge: 5 },
];

describe("calculateShipping", () => {
  it("charges weight times the per-kg rate when above the minimum", () => {
    const result = calculateShipping({
      weightGrams: 2000,
      category: "electronics",
      rates,
    });

    expect(result.shippingCost).toBe(28); // 2kg * 14
    expect(result.applicableRate.category).toBe("electronics");
  });

  it("applies the minimum charge when the weight-based cost is lower", () => {
    const result = calculateShipping({
      weightGrams: 200,
      category: "electronics",
      rates,
    });

    expect(result.shippingCost).toBe(10); // 0.2kg * 14 = 2.8, below the $10 minimum
  });

  it("handles a category with no minimum charge", () => {
    const result = calculateShipping({
      weightGrams: 500,
      category: "clothing",
      rates,
    });

    expect(result.shippingCost).toBe(4); // 0.5kg * 8
  });

  it("falls back to the general category when the category is unknown", () => {
    const result = calculateShipping({
      weightGrams: 1000,
      category: "unknown-category",
      rates,
    });

    expect(result.applicableRate.category).toBe("general");
    expect(result.shippingCost).toBe(10); // 1kg * 10
  });

  it("throws when neither the category nor a general fallback exists", () => {
    expect(() =>
      calculateShipping({
        weightGrams: 1000,
        category: "unknown-category",
        rates: rates.filter((r) => r.category !== "general"),
      }),
    ).toThrow();
  });

  it("rounds the shipping cost to 2 decimals", () => {
    const result = calculateShipping({
      weightGrams: 333,
      category: "clothing",
      rates,
    });

    expect(result.shippingCost).toBe(2.66); // 0.333kg * 8
  });
});
