import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "100");

  const leaderboard = await prisma.leaderboard.findMany({
    take: limit,
    orderBy: [{ rank: "asc" }, { score: "desc" }, { tiebreakDistance: "asc" }, { updatedAt: "asc" }],
    include: {
      entry: {
        include: {
          user: { select: { firstName: true, lastName: true, countryCode: true } },
          predictions: { select: { id: true } }
        }
      }
    }
  });

  return NextResponse.json({
    leaderboard: leaderboard.map((row) => ({
      id: row.id,
      rank: row.rank,
      score: row.score,
      tiebreakDistance: row.tiebreakDistance,
      updatedAt: row.updatedAt,
      totalMatches: row.entry.totalMatches,
      participant: {
        firstName: row.entry.user.firstName,
        lastName: row.entry.user.lastName,
        countryCode: row.entry.user.countryCode
      }
    }))
  });
}
