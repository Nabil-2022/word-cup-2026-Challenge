import { NextResponse, type NextRequest } from "next/server";
import { isCountryAllowed } from "@/lib/compliance";

export function middleware(request: NextRequest) {
  const geoCountry = (request as NextRequest & { geo?: { country?: string } }).geo?.country;
  const countryCode = geoCountry ?? request.headers.get("x-vercel-ip-country") ?? "";

  if (countryCode && !isCountryAllowed(countryCode)) {
    return NextResponse.redirect(new URL("/not-available", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/predictions/:path*", "/participant/:path*", "/payment/:path*", "/api/entries/:path*", "/api/checkout/:path*"]
};
