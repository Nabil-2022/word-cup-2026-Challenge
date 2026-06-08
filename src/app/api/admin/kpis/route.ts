import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getAdminKpis } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ kpis: await getAdminKpis() });
}
