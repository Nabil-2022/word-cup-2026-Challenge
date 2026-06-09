import { prisma } from "@/lib/prisma";
import { getJsonEntries, getJsonMatches } from "@/lib/json-db";

export async function getAdminKpis() {
  let totalRegisteredUsers = 0;
  let paidParticipants = 0;
  let entryCompletionRows: Array<{ totalMatches: number; completedMatches: number }> = [];
  let topEntry: { score: number } | null = null;
  let countries: Array<{ countryCode: string; _count: { countryCode: number } }> = [];
  let blockedUsers = 0;
  let disputedPayments = 0;
  let revenueAggregate = { _sum: { amount: null as null | { toString: () => string } } };
  let platformFeeAggregate = { _sum: { platformFee: null as null | { toString: () => string } } };
  let prizeBudgetAggregate = { _sum: { prizeBudgetAmount: null as null | { toString: () => string } } };

  try {
    [
      totalRegisteredUsers,
      paidParticipants,
      entryCompletionRows,
      topEntry,
      countries,
      blockedUsers,
      disputedPayments,
      revenueAggregate,
      platformFeeAggregate,
      prizeBudgetAggregate
    ] = await Promise.all([
      prisma.user.count(),
      prisma.entry.count({ where: { status: { in: ["locked", "scored", "validated"] } } }),
      prisma.entry.findMany({ select: { totalMatches: true, completedMatches: true } }),
      prisma.entry.findFirst({ orderBy: { score: "desc" }, select: { score: true } }),
      prisma.user.groupBy({ by: ["countryCode"], _count: { countryCode: true }, orderBy: { countryCode: "asc" } }),
      prisma.user.count({ where: { eligibilityStatus: { in: ["blocked_country", "underage", "excluded"] } } }),
      prisma.payment.count({ where: { status: "disputed" } }),
      prisma.payment.aggregate({ where: { status: "succeeded" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "succeeded" }, _sum: { platformFee: true } }),
      prisma.payment.aggregate({ where: { status: "succeeded" }, _sum: { prizeBudgetAmount: true } })
    ]);
  } catch {
    const [jsonEntries, jsonMatches] = await Promise.all([getJsonEntries(), getJsonMatches()]);
    const usersByEmail = new Map(jsonEntries.map((entry) => [entry.user.email, entry.user]));
    const countriesByCode = new Map<string, number>();

    for (const user of usersByEmail.values()) {
      countriesByCode.set(user.countryCode, (countriesByCode.get(user.countryCode) ?? 0) + 1);
    }

    totalRegisteredUsers = usersByEmail.size;
    paidParticipants = jsonEntries.filter((entry) => entry.status === "locked").length;
    entryCompletionRows = jsonEntries.map((entry) => ({
      totalMatches: entry.totalMatches || jsonMatches.length,
      completedMatches: entry.completedMatches
    }));
    countries = [...countriesByCode.entries()].map(([countryCode, count]) => ({
      countryCode,
      _count: { countryCode: count }
    }));
  }

  return {
    totalRegisteredUsers,
    paidParticipants,
    totalRevenue: revenueAggregate._sum.amount?.toString() ?? "0.00",
    platformFees: platformFeeAggregate._sum.platformFee?.toString() ?? "0.00",
    prizeBudget: prizeBudgetAggregate._sum.prizeBudgetAmount?.toString() ?? "0.00",
    completedPredictionGrids: entryCompletionRows.filter(
      (entry) => entry.totalMatches > 0 && entry.completedMatches === entry.totalMatches
    ).length,
    topScore: topEntry?.score ?? 0,
    countries: countries.map((country) => ({
      countryCode: country.countryCode,
      users: country._count.countryCode
    })),
    blockedUsers,
    disputedPayments
  };
}

export async function getAdminLists() {
  const [users, matches, entries, payments, leaderboard, winners, complianceLogs, auditLogs] =
    await Promise.all([
      prisma.user.findMany({ take: 100, orderBy: { createdAt: "desc" } }),
      prisma.match.findMany({ take: 100, orderBy: { matchDate: "asc" } }),
      prisma.entry.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { user: true, predictions: { include: { match: true } } }
      }),
      prisma.payment.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { user: true, entry: true }
      }),
      prisma.leaderboard.findMany({
        take: 100,
        orderBy: { rank: "asc" },
        include: { entry: { include: { user: true } } }
      }),
      prisma.winner.findMany({
        take: 100,
        orderBy: { rank: "asc" },
        include: { user: true, entry: true }
      }),
      prisma.complianceLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { user: true }
      }),
      prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: { admin: true }
      })
    ]);

  return { users, matches, entries, payments, leaderboard, winners, complianceLogs, auditLogs };
}
