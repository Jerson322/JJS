import { describe, expect, it } from "vitest";
import { ALLOWED_TRANSITIONS, assertTransition, canTransition } from "./transitions";
import type { RequestStatus } from "@/generated/prisma/enums";

const ALL_STATUSES = Object.keys(ALLOWED_TRANSITIONS) as RequestStatus[];

describe("status machine transitions", () => {
  it.each(ALL_STATUSES)("every declared transition from %s is allowed", (from) => {
    for (const to of ALLOWED_TRANSITIONS[from]) {
      expect(canTransition(from, to)).toBe(true);
      expect(() => assertTransition(from, to)).not.toThrow();
    }
  });

  it("rejects every pair not explicitly declared", () => {
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        const isDeclared = ALLOWED_TRANSITIONS[from].includes(to);
        if (!isDeclared) {
          expect(canTransition(from, to)).toBe(false);
          expect(() => assertTransition(from, to)).toThrow();
        }
      }
    }
  });

  it("has no outgoing transitions from terminal states", () => {
    expect(ALLOWED_TRANSITIONS.DELIVERED).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toHaveLength(0);
  });
});
