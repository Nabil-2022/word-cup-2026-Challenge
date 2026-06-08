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

  const match = await prisma.match.create({
    data: payload.data
  });

  await prisma.auditLog.create({
    data: {
      adminId: auth.admin.id,
      action: "match_created",
      entityType: "match",
      entityId: match.id,
      metadata: payload.data
    }
  });

  return NextResponse.json({ match }, { status: 201 });
}
