import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSessionToken, setAdminSessionCookie } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 400 });
  }

  let admin = null;

  try {
    admin = await prisma.admin.findUnique({
      where: { email: payload.data.email }
    });
  } catch {
    admin = null;
  }

  if (!admin) {
    const demoEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
    const demoPassword = process.env.ADMIN_PASSWORD ?? "replace-with-a-secure-password";
    const allowDemoAdmin = process.env.NODE_ENV !== "production";

    if (!allowDemoAdmin || payload.data.email !== demoEmail || payload.data.password !== demoPassword) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const token = createAdminSessionToken({
      adminId: "demo-admin",
      email: demoEmail,
      role: "owner"
    });
    const response = NextResponse.json({ ok: true, demoMode: true });
    setAdminSessionCookie(response, token);

    return response;
  }

  const isValidPassword = await bcrypt.compare(payload.data.password, admin.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  try {
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "admin_login",
        entityType: "admin",
        entityId: admin.id,
        metadata: {
          email: admin.email
        }
      }
    });
  } catch {
    // Login should still work if audit persistence is temporarily unavailable in local demo mode.
  }
  const token = createAdminSessionToken({
    adminId: admin.id,
    email: admin.email,
    role: admin.role
  });
  const response = NextResponse.json({ ok: true });
  setAdminSessionCookie(response, token);

  return response;
}
