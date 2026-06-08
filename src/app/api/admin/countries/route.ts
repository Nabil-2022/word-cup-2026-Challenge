import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getCountryPolicy } from "@/lib/country-policy";
import { prisma } from "@/lib/prisma";

const countriesSchema = z.object({
  allowedCountries: z.array(z.string().length(2)).default([]),
  blockedCountries: z.array(z.string().length(2)).default([])
});

function normalize(countries: string[]) {
  return countries.map((country) => country.toUpperCase()).sort();
}

export async function GET() {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ policy: await getCountryPolicy() });
}

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = countriesSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid country policy payload" }, { status: 400 });
  }

  const allowedCountries = normalize(payload.data.allowedCountries);
  const blockedCountries = normalize(payload.data.blockedCountries);

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: "allowed_countries" },
      create: { key: "allowed_countries", value: allowedCountries },
      update: { value: allowedCountries }
    }),
    prisma.setting.upsert({
      where: { key: "blocked_countries" },
      create: { key: "blocked_countries", value: blockedCountries },
      update: { value: blockedCountries }
    }),
    prisma.auditLog.create({
      data: {
        adminId: auth.admin.id,
        action: "country_policy_updated",
        entityType: "settings",
        entityId: "country_policy",
        metadata: { allowedCountries, blockedCountries }
      }
    })
  ]);

  return NextResponse.json({ policy: { allowedCountries, blockedCountries } });
}
