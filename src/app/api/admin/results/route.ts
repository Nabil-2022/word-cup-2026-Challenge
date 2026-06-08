import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { resolveMatchResult } from "@/lib/scoring";

const resultSchema = z.object({
  matchId: z.string().min(1),
  scoreTeam1: z.number().int().min(0),
  scoreTeam2: z.number().int().min(0),
  status: z.enum(["finished", "cancelled"]).default("finished")
});

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = resultSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const match = await prisma.match.update({
    where: { id: payload.data.matchId },
    data: {
      scoreTeam1: payload.data.scoreTeam1,
      scoreTeam2: payload.data.scoreTeam2,
      result: resolveMatchResult(payload.data.scoreTeam1, payload.data.scoreTeam2),
      status: payload.data.status
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: auth.admin.id,
      action: "official_score_saved",
      entityType: "match",
      entityId: match.id,
      metadata: {
        scoreTeam1: match.scoreTeam1,
        scoreTeam2: match.scoreTeam2,
        result: match.result,
        status: match.status
      }
    }
  });

  return NextResponse.json({ match });
}
