import { describe, expect, it } from "vitest";
import { rankShortcuts, type ShortcutEntry } from "./rank";

const entries: ShortcutEntry[] = [
  {
    id: "shoes",
    brandLabel: "Nike",
    label: "SHOES",
    url: "https://www.nike.com/w/shoes",
    keywords: ["zapatillas", "zapatos", "shoes", "tenis", "calzado"],
    sortOrder: 0,
  },
  {
    id: "af1",
    brandLabel: "Nike",
    label: "AIR FORCE 1",
    url: "https://www.nike.com/w/air-force-1-shoes",
    keywords: ["air force 1", "air force one", "airforce 1", "af1", "zapatillas air force"],
    sortOrder: 1,
  },
  {
    id: "dunk",
    brandLabel: "Nike",
    label: "DUNK",
    url: "https://www.nike.com/w/dunk",
    keywords: ["dunk", "nike dunk", "zapatillas dunk"],
    sortOrder: 2,
  },
  {
    id: "pegasus",
    brandLabel: "Nike",
    label: "PEGASUS",
    url: "https://www.nike.com/w/nike-pegasus",
    keywords: ["pegasus", "nike pegasus", "zapatillas pegasus"],
    sortOrder: 3,
  },
];

describe("rankShortcuts", () => {
  it("returns a broad list of results for a generic query", () => {
    const result = rankShortcuts("zapatillas", entries);
    const ids = result.map((r) => r.id);
    expect(ids).toContain("shoes");
    expect(ids).toContain("af1");
    expect(ids).toContain("dunk");
    expect(ids).toContain("pegasus");
    expect(result.length).toBeGreaterThanOrEqual(4);
  });

  it("narrows down to a single precise match for a specific query", () => {
    const result = rankShortcuts("zapatos air force one", entries);
    expect(result[0].id).toBe("af1");
    // dunk/pegasus should not sneak in just because "zapatos" is generic
    expect(result.some((r) => r.id === "dunk")).toBe(false);
    expect(result.some((r) => r.id === "pegasus")).toBe(false);
  });

  it("matches on brand name alone", () => {
    const result = rankShortcuts("nike", entries);
    expect(result.length).toBe(entries.length);
  });

  it("returns nothing for an unrelated query", () => {
    const result = rankShortcuts("refrigerador", entries);
    expect(result).toEqual([]);
  });

  it("respects the limit", () => {
    const result = rankShortcuts("zapatillas", entries, 2);
    expect(result.length).toBe(2);
  });

  it("ranks an exact label match first", () => {
    const result = rankShortcuts("dunk", entries);
    expect(result[0].id).toBe("dunk");
  });
});
