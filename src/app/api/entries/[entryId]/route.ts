import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    entryId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { entryId } = await context.params;
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, countryCode: true } },
      predictions: {
        include: {
          match: true
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      payments: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ entry });
}
