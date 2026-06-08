import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type AdminSession = {
  adminId: string;
  email: string;
  role: string;
  expiresAt: number;
};

const sessionCookieName = "admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret && process.env.NODE_ENV !== "production") {
    return "local-demo-admin-session-secret-value";
  }

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(session: Omit<AdminSession, "expiresAt">) {
  const payload = base64UrlEncode(
    JSON.stringify({
      ...session,
      expiresAt: Date.now() + sessionMaxAgeSeconds * 1000
    })
  );
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  const session = JSON.parse(base64UrlDecode(payload)) as AdminSession;

  if (session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(sessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  let admin = null;

  try {
    admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, name: true, email: true, role: true }
    });
  } catch {
    admin = null;
  }

  if (!admin) {
    if (process.env.NODE_ENV !== "production" && session.adminId === "demo-admin") {
      return {
        id: "demo-admin",
        name: "Demo Admin",
        email: session.email,
        role: "owner"
      };
    }

    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();

  if (!session) {
    return { response: NextResponse.json({ error: "Admin authentication required" }, { status: 401 }) };
  }

  let admin = null;

  try {
    admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, name: true, email: true, role: true }
    });
  } catch {
    admin = null;
  }

  if (!admin) {
    if (process.env.NODE_ENV !== "production" && session.adminId === "demo-admin") {
      return {
        admin: {
          id: "demo-admin",
          name: "Demo Admin",
          email: session.email,
          role: "owner"
        }
      };
    }

    return { response: NextResponse.json({ error: "Admin authentication required" }, { status: 401 }) };
  }

  return { admin };
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAgeSeconds,
    path: "/"
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
