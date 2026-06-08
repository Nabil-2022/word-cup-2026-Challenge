import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdult } from "@/lib/compliance";
import { isCountryAllowedByPolicy } from "@/lib/country-policy";
import { canCreateNewEntry } from "@/lib/functional-rules";
import { fallbackMatches } from "@/lib/matches";
import { prisma } from "@/lib/prisma";

const entrySchema = z.object({
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    countryCode: z.string().length(2),
    birthDate: z.coerce.date(),
    isAdult: z.literal(true)
  }),
  tieBreakAnswer: z.number().int().nonnegative(),
  termsAccepted: z.literal(true),
  predictions: z.array(
    z.object({
      matchId: z.string().min(1),
      choice: z.enum(["ONE", "DRAW", "TWO"])
    })
  )
});

export async function POST(request: Request) {
  const payload = entrySchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid entry payload" }, { status: 400 });
  }

  const { user, tieBreakAnswer, predictions, termsAccepted } = payload.data;
  const uniqueMatchIds = new Set(predictions.map((prediction) => prediction.matchId));

  if (!(await isCountryAllowedByPolicy(user.countryCode))) {
    return NextResponse.json({ error: "Country is not approved" }, { status: 403 });
  }

  if (!isAdult(user.birthDate)) {
    return NextResponse.json({ error: "Participants must be 18+" }, { status: 403 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: { entries: { select: { status: true } } }
  });

  if (existingUser && !canCreateNewEntry(existingUser.entries.map((entry) => entry.status))) {
    return NextResponse.json({ error: "Locked prediction grids cannot be modified" }, { status: 409 });
  }

  const activeMatches = await prisma.match.count({
    where: { status: { not: "cancelled" } }
  });
  if (activeMatches === 0) {
    await prisma.match.createMany({
      data: fallbackMatches.map((match) => ({
        id: match.id,
        groupName: match.groupName,
        team1: match.team1,
        team2: match.team2,
        matchDate: new Date(match.matchDate)
      })),
      skipDuplicates: true
    });
  }

  const totalMatches = await prisma.match.count({
    where: { status: { not: "cancelled" } }
  });

  if (totalMatches === 0) {
    return NextResponse.json({ error: "No active matches are configured" }, { status: 400 });
  }

  if (predictions.length !== totalMatches || uniqueMatchIds.size !== totalMatches) {
    return NextResponse.json({ error: "Prediction grid must be complete" }, { status: 400 });
  }

  const entry = await prisma.$transaction(async (tx) => {
    const createdEntry = await tx.entry.create({
      data: {
        tiebreakAnswer: tieBreakAnswer,
        totalMatches,
        completedMatches: predictions.length,
        status: "pending_payment",
        user: {
          connectOrCreate: {
            where: { email: user.email },
            create: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              countryCode: user.countryCode.toUpperCase(),
              birthDate: user.birthDate,
              isAdult: user.isAdult,
              eligibilityStatus: "eligible",
              status: "registered"
            }
          }
        },
        predictions: {
          createMany: {
            data: predictions.map((prediction) => ({
              matchId: prediction.matchId,
              choice: prediction.choice
            }))
          }
        }
      },
      include: { user: true, predictions: true }
    });

    await tx.complianceLog.create({
      data: {
        userId: createdEntry.userId,
        action: termsAccepted ? "terms_accepted" : "entry_created",
        country: user.countryCode.toUpperCase(),
        termsVersion: process.env.TERMS_VERSION ?? "v1"
      }
    });

    return createdEntry;
  });

  return NextResponse.json({ entry }, { status: 201 });
}
