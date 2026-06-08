import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupName = searchParams.get("groupName") ?? undefined;

  const matches = await prisma.match.findMany({
    where: { status: "finished", groupName },
    orderBy: { matchDate: "asc" }
  });

  return NextResponse.json({ matches });
}
