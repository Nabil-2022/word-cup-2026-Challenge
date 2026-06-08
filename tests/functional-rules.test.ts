import { describe, expect, it } from "vitest";
import {
  applyFailedPayment,
  applySuccessfulPayment,
  calculateEntryScore,
  calculateTiebreakDistance,
  canCreateNewEntry,
  canModifyPredictionGrid,
  canStartCheckout,
  evaluateEligibility,
  hasAuditAction,
  isAdminRequestAllowed,
  sortLeaderboard
} from "@/lib/functional-rules";
import { resolveMatchResult } from "@/lib/scoring";

describe("functional user flow rules", () => {
  it("blocks an underage user", () => {
    const status = evaluateEligibility({
      birthDate: new Date("2012-01-01T00:00:00.000Z"),
      countryCode: "US",
      allowedCountries: ["US"],
      blockedCountries: []
    });

    expect(status).toBe("underage");
  });

  it("refuses a blocked country", () => {
    const status = evaluateEligibility({
      birthDate: new Date("1990-01-01T00:00:00.000Z"),
      countryCode: "BR",
      allowedCountries: ["US", "CA"],
      blockedCountries: ["BR"]
    });

    expect(status).toBe("blocked_country");
  });

  it("blocks checkout when the prediction grid is incomplete", () => {
    expect(
      canStartCheckout({
        status: "pending_payment",
        totalMatches: 8,
        completedMatches: 7,
        predictionsCount: 7
      })
    ).toBe(false);
  });

  it("allows checkout when the prediction grid is complete", () => {
    expect(
      canStartCheckout({
        status: "pending_payment",
        totalMatches: 8,
        completedMatches: 8,
        predictionsCount: 8
      })
    ).toBe(true);
  });

  it("keeps the grid unlocked when payment fails", () => {
    const result = applyFailedPayment("pending_payment");

    expect(result.payment.status).toBe("failed");
    expect(result.entry.status).toBe("pending_payment");
  });

  it("locks the grid only after a successful webhook state transition", () => {
    const result = applySuccessfulPayment();

    expect(result.payment.status).toBe("succeeded");
    expect(result.payment.platformFee).toBe(0.3);
    expect(result.payment.prizeBudgetAmount).toBe(0.7);
    expect(result.entry.status).toBe("locked");
    expect(result.entry.lockedAt).toBeInstanceOf(Date);
  });

  it("does not allow a locked prediction grid to be modified", () => {
    expect(canModifyPredictionGrid("locked")).toBe(false);
    expect(canCreateNewEntry(["locked"])).toBe(false);
  });
});

describe("match result and scoring rules", () => {
  it("resolves 2-1 as ONE", () => {
    expect(resolveMatchResult(2, 1)).toBe("ONE");
  });

  it("resolves 1-1 as DRAW", () => {
    expect(resolveMatchResult(1, 1)).toBe("DRAW");
  });

  it("resolves 0-3 as TWO", () => {
    expect(resolveMatchResult(0, 3)).toBe("TWO");
  });

  it("calculates participant score correctly", () => {
    expect(
      calculateEntryScore([
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
        { isCorrect: null }
      ])
    ).toBe(2);
  });

  it("calculates tie-break distance correctly", () => {
    expect(calculateTiebreakDistance(124, 130)).toBe(6);
  });

  it("sorts leaderboard by score DESC then tie-break distance ASC", () => {
    const sorted = sortLeaderboard([
      { entryId: "a", score: 4, tiebreakDistance: 2, validatedAt: new Date("2026-01-01") },
      { entryId: "b", score: 5, tiebreakDistance: 8, validatedAt: new Date("2026-01-02") },
      { entryId: "c", score: 5, tiebreakDistance: 1, validatedAt: new Date("2026-01-03") }
    ]);

    expect(sorted.map((entry) => entry.entryId)).toEqual(["c", "b", "a"]);
  });
});

describe("admin safety rules", () => {
  it("protects admin routes without a valid session", () => {
    expect(isAdminRequestAllowed(false)).toBe(false);
    expect(isAdminRequestAllowed(true)).toBe(true);
  });

  it("tracks audit actions for sensitive operations", () => {
    expect(hasAuditAction("scores_recalculated")).toBe(true);
    expect(hasAuditAction("leaderboard_generated")).toBe(true);
    expect(hasAuditAction("official_score_saved")).toBe(true);
    expect(hasAuditAction("unknown_action")).toBe(false);
  });
});
