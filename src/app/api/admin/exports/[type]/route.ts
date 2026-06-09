import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { getJsonExportRows } from "@/lib/json-db";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const { type } = await context.params;
  const rows = await getRows(type);

  if (!rows) {
    return NextResponse.json({ error: "Unknown export type" }, { status: 404 });
  }

  try {
    await prisma.auditLog.create({
      data: {
        adminId: auth.admin.id,
        action: "csv_exported",
        entityType: "export",
        entityId: type,
        metadata: { rows: rows.length }
      }
    });
  } catch {
    // CSV export should still work when audit persistence is unavailable in JSON demo mode.
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}.csv"`
    }
  });
}

async function getRows(type: string): Promise<Array<Record<string, unknown>> | null> {
  try {
    if (type === "participants") {
      return await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (type === "matches") {
      return await prisma.match.findMany({ orderBy: { matchDate: "asc" } });
    }

    if (type === "entries") {
      return await prisma.entry.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (type === "payments") {
      return await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (type === "leaderboard") {
      return await prisma.leaderboard.findMany({ orderBy: { rank: "asc" } });
    }

    if (type === "winners") {
      return await prisma.winner.findMany({ orderBy: { rank: "asc" } });
    }

    if (type === "compliance") {
      return await prisma.complianceLog.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (type === "audit") {
      return await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch {
    return getJsonExportRows(type);
  }

  return null;
}
