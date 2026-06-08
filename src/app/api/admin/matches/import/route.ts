import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const importSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string().optional(),
      groupName: z.string().optional(),
      team1: z.string().min(1),
      team2: z.string().min(1),
      matchDate: z.coerce.date()
    })
  )
});

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = importSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid match import payload" }, { status: 400 });
  }

  const matches = await prisma.$transaction(
    payload.data.matches.map((match) => {
      const importId = match.id ?? `${match.team1}-${match.team2}-${match.matchDate.toISOString()}`;

      return (
      prisma.match.upsert({
        where: { id: importId },
        create: {
          id: importId,
          groupName: match.groupName,
          team1: match.team1,
          team2: match.team2,
          matchDate: match.matchDate
        },
        update: {
          groupName: match.groupName,
          team1: match.team1,
          team2: match.team2,
          matchDate: match.matchDate
        }
      })
      );
    })
  );

  await prisma.auditLog.create({
    data: {
      adminId: auth.admin.id,
      action: "matches_imported",
      entityType: "match",
      entityId: "bulk_import",
      metadata: { importedMatches: matches.length }
    }
  });

  return NextResponse.json({ importedMatches: matches.length });
}
