import type { Prisma, PrismaClient } from "@prisma/client";
import { calculateEntryScore, calculateTiebreakDistance, sortLeaderboard } from "@/lib/functional-rules";
import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

export function resolveMatchResult(scoreTeam1: number, scoreTeam2: number) {
  if (scoreTeam1 > scoreTeam2) {
    return "ONE" as const;
  }

  if (scoreTeam1 < scoreTeam2) {
    return "TWO" as const;
  }

  return "DRAW" as const;
}

export async function calculateActualTotalGoals(db: DbClient = prisma) {
  const finishedGroupMatches = await db.match.findMany({
    where: {
      status: "finished",
      groupName: { not: null },
      scoreTeam1: { not: null },
      scoreTeam2: { not: null }
    },
    select: {
      scoreTeam1: true,
      scoreTeam2: true
    }
  });

  return finishedGroupMatches.reduce(
    (total, match) => total + (match.scoreTeam1 ?? 0) + (match.scoreTeam2 ?? 0),
    0
  );
}

export async function recalculateScores(adminId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const finishedMatches = await tx.match.findMany({
      where: {
        status: "finished",
        scoreTeam1: { not: null },
        scoreTeam2: { not: null }
      },
      select: {
        id: true,
        scoreTeam1: true,
        scoreTeam2: true
      }
    });

    for (const match of finishedMatches) {
      if (match.scoreTeam1 === null || match.scoreTeam2 === null) {
        continue;
      }

      const result = resolveMatchResult(match.scoreTeam1, match.scoreTeam2);

      await tx.match.update({
        where: { id: match.id },
        data: { result }
      });

      await tx.prediction.updateMany({
        where: { matchId: match.id, choice: result },
        data: { isCorrect: true }
      });

      await tx.prediction.updateMany({
        where: { matchId: match.id, choice: { not: result } },
        data: { isCorrect: false }
      });
    }

    const actualTotalGoals = await calculateActualTotalGoals(tx);
    const entries = await tx.entry.findMany({
      where: {
        status: { in: ["locked", "scored", "validated"] }
      },
      include: {
        predictions: {
          select: {
            isCorrect: true
          }
        }
      }
    });

    let scoredEntries = 0;

    for (const entry of entries) {
      const score = calculateEntryScore(entry.predictions);
      const tiebreakDistance =
        entry.tiebreakAnswer === null ? null : calculateTiebreakDistance(entry.tiebreakAnswer, actualTotalGoals);

      await tx.entry.update({
        where: { id: entry.id },
        data: {
          score,
          tiebreakDistance,
          status: "scored"
        }
      });

      scoredEntries += 1;
    }

    await tx.auditLog.create({
      data: {
        adminId: adminId ?? null,
        action: "scores_recalculated",
        entityType: "scoring_engine",
        entityId: "global",
        metadata: {
          finishedMatches: finishedMatches.length,
          scoredEntries,
          actualTotalGoals
        }
      }
    });

    return {
      finishedMatches: finishedMatches.length,
      scoredEntries,
      actualTotalGoals
    };
  });
}

export async function generateLeaderboard(adminId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const entries = await tx.entry.findMany({
      where: {
        status: { in: ["locked", "scored", "validated"] },
        tiebreakDistance: { not: null },
        validatedAt: { not: null }
      }
    });
    const sortedEntries = sortLeaderboard(
      entries.map((entry) => ({
        entryId: entry.id,
        score: entry.score,
        tiebreakDistance: entry.tiebreakDistance ?? 0,
        validatedAt: entry.validatedAt ?? new Date(0)
      }))
    );

    await tx.leaderboard.deleteMany({});

    let currentRank = 0;
    let previousSortKey = "";

    for (let index = 0; index < sortedEntries.length; index += 1) {
      const leaderboardEntry = sortedEntries[index];
      const entry = entries.find((candidate) => candidate.id === leaderboardEntry.entryId);
      if (!entry) {
        continue;
      }
      const sortKey = `${entry.score}:${entry.tiebreakDistance}:${entry.validatedAt?.toISOString()}`;

      if (sortKey !== previousSortKey) {
        currentRank = index + 1;
        previousSortKey = sortKey;
      }

      await tx.entry.update({
        where: { id: entry.id },
        data: { rank: currentRank }
      });

      await tx.leaderboard.create({
        data: {
          entryId: entry.id,
          score: entry.score,
          rank: currentRank,
          tiebreakDistance: entry.tiebreakDistance
        }
      });
    }

    await tx.auditLog.create({
      data: {
        adminId: adminId ?? null,
        action: "leaderboard_generated",
        entityType: "leaderboard_engine",
        entityId: "global",
        metadata: {
          rankedEntries: sortedEntries.length
        }
      }
    });

    return {
      rankedEntries: sortedEntries.length
    };
  });
}
