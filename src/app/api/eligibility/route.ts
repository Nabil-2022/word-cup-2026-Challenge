import { NextResponse } from "next/server";
import { getCountryPolicy } from "@/lib/country-policy";

export async function GET() {
  const policy = await getCountryPolicy();

  return NextResponse.json({
    minimumAge: 18,
    allowedCountries: policy.allowedCountries,
    blockedCountries: policy.blockedCountries
  });
}
