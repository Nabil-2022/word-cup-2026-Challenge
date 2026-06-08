import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { generateLeaderboard } from "@/lib/scoring";

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const result = await generateLeaderboard(auth.admin.id);

  return NextResponse.json({
    ok: true,
    ...result
  });
}
