export type EntryLike = {
  status: string;
  totalMatches: number;
  completedMatches: number;
  predictionsCount: number;
  paymentStatus?: string;
};

export type ScorePrediction = {
  isCorrect: boolean | null;
};

export type LeaderboardCandidate = {
  entryId: string;
  score: number;
  tiebreakDistance: number;
  validatedAt: Date;
};

export const sensitiveAuditActions = [
  "admin_login",
  "match_created",
  "matches_imported",
  "official_score_saved",
  "scores_recalculated",
  "leaderboard_generated",
  "country_policy_updated",
  "setting_updated",
  "csv_exported",
  "stripe_checkout_created",
  "stripe_checkout_completed",
  "stripe_payment_failed",
  "stripe_payment_refunded",
  "stripe_payment_disputed"
] as const;

export function evaluateEligibility({
  birthDate,
  countryCode,
  allowedCountries,
  blockedCountries
}: {
  birthDate: Date;
  countryCode: string;
  allowedCountries: string[];
  blockedCountries: string[];
}) {
  const country = countryCode.toUpperCase();
  const isAdult = calculateAge(birthDate) >= 18;

  if (!isAdult) {
    return "underage" as const;
  }

  if (blockedCountries.includes(country) || (allowedCountries.length > 0 && !allowedCountries.includes(country))) {
    return "blocked_country" as const;
  }

  return "eligible" as const;
}

export function calculateAge(birthDate: Date, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (birthdayThisYear > today) {
    age -= 1;
  }

  return age;
}

export function canStartCheckout(entry: EntryLike) {
  return (
    entry.status === "pending_payment" &&
    entry.totalMatches > 0 &&
    entry.completedMatches === entry.totalMatches &&
    entry.predictionsCount === entry.totalMatches
  );
}

export function canModifyPredictionGrid(status: string) {
  return !["locked", "scored", "excluded"].includes(status);
}

export function canCreateNewEntry(existingStatuses: string[]) {
  return !existingStatuses.some((status) => !canModifyPredictionGrid(status));
}

export function applySuccessfulPayment() {
  return {
    payment: {
      status: "succeeded" as const,
      amount: 1,
      platformFee: 0.3,
      prizeBudgetAmount: 0.7
    },
    entry: {
      status: "locked" as const,
      lockedAt: expectDate()
    }
  };
}

export function applyFailedPayment(currentEntryStatus: string) {
  return {
    payment: { status: "failed" as const },
    entry: { status: currentEntryStatus === "draft" ? "draft" : "pending_payment" }
  };
}

export function calculateEntryScore(predictions: ScorePrediction[]) {
  return predictions.filter((prediction) => prediction.isCorrect === true).length;
}

export function calculateTiebreakDistance(tiebreakAnswer: number, actualTotalGoals: number) {
  return Math.abs(tiebreakAnswer - actualTotalGoals);
}

export function sortLeaderboard(entries: LeaderboardCandidate[]) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (a.tiebreakDistance !== b.tiebreakDistance) {
      return a.tiebreakDistance - b.tiebreakDistance;
    }

    return a.validatedAt.getTime() - b.validatedAt.getTime();
  });
}

export function hasAuditAction(action: string) {
  return sensitiveAuditActions.includes(action as (typeof sensitiveAuditActions)[number]);
}

export function isAdminRequestAllowed(hasValidSession: boolean) {
  return hasValidSession;
}

function expectDate() {
  return new Date();
}
