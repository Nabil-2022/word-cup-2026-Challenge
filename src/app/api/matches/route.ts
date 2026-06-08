import { NextResponse } from "next/server";
import { getJsonMatches } from "@/lib/json-db";
import { fallbackMatches } from "@/lib/matches";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const matches = await prisma.match
    .findMany({
      where: { status: { not: "cancelled" } },
      orderBy: [{ matchDate: "asc" }, { groupName: "asc" }]
    })
    .catch(() => []);

  if (matches.length > 0) {
    return NextResponse.json({ matches, source: "database" });
  }

  const jsonMatches = await getJsonMatches();

  return NextResponse.json({
    matches: jsonMatches.length > 0 ? jsonMatches : fallbackMatches,
    source: jsonMatches.length > 0 ? "json" : "fallback"
  });
}
