import { NextResponse } from "next/server";
import { fallbackMatches } from "@/lib/matches";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match
    .findMany({
      where: { status: { not: "cancelled" } },
      orderBy: [{ matchDate: "asc" }, { groupName: "asc" }]
    })
    .catch(() => []);

  return NextResponse.json({
    matches: matches.length > 0 ? matches : fallbackMatches,
    source: matches.length > 0 ? "database" : "fallback"
  });
}
