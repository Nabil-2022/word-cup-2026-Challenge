import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown()
});

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if ("response" in auth) {
    return auth.response;
  }

  const payload = settingSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key: payload.data.key },
    create: {
      key: payload.data.key,
      value: payload.data.value as Prisma.InputJsonValue
    },
    update: {
      value: payload.data.value as Prisma.InputJsonValue
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: auth.admin.id,
      action: "setting_updated",
      entityType: "setting",
      entityId: setting.key,
      metadata: { key: setting.key }
    }
  });

  return NextResponse.json({ setting }, { status: 201 });
}
