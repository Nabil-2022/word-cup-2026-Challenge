import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const matchSchema = z.object({
  groupName: z.string().optional(),
  team1: z.string().min(1),
  team2: z.string().min(1),
  matchDate: z.coerce.date()
});

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = matchSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid match payload" }, { status: 400 });
  }

  let match = null;

  try {
    match = await prisma.match.create({
      data: payload.data
    });
  } catch {
    const now = new Date();

    return NextResponse.json(
      {
        demoMode: true,
        match: {
          id: `demo-match-${now.getTime()}`,
          groupName: payload.data.groupName ?? null,
          team1: payload.data.team1,
          team2: payload.data.team2,
          matchDate: payload.data.matchDate,
          scoreTeam1: null,
          scoreTeam2: null,
          result: null,
          status: "upcoming",
          createdAt: now
        }
      },
      { status: 201 }
    );
  }

  try {
    await prisma.auditLog.create({
      data: {
        adminId: auth.admin.id,
        action: "match_created",
        entityType: "match",
        entityId: match.id,
        metadata: payload.data
      }
    });
  } catch {
    // Match creation should remain available even if audit persistence is temporarily unavailable.
  }

  return NextResponse.json({ match }, { status: 201 });
}
