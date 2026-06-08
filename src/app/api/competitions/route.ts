import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ["challenge_name", "entry_fee", "allowed_countries", "terms_version"]
      }
    },
    orderBy: { key: "asc" }
  });

  return NextResponse.json({ settings });
}
