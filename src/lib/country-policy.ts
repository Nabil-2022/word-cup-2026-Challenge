import { getAllowedCountries } from "@/lib/compliance";
import { prisma } from "@/lib/prisma";

type CountryPolicy = {
  allowedCountries: string[];
  blockedCountries: string[];
};

function normalizeCountries(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((country): country is string => typeof country === "string")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

export async function getCountryPolicy(): Promise<CountryPolicy> {
  const settings = await prisma.setting
    .findMany({
      where: { key: { in: ["allowed_countries", "blocked_countries"] } }
    })
    .catch(() => []);
  const allowedSetting = settings.find((setting) => setting.key === "allowed_countries");
  const blockedSetting = settings.find((setting) => setting.key === "blocked_countries");

  return {
    allowedCountries: normalizeCountries(allowedSetting?.value).length
      ? normalizeCountries(allowedSetting?.value)
      : getAllowedCountries(),
    blockedCountries: normalizeCountries(blockedSetting?.value)
  };
}

export async function isCountryAllowedByPolicy(countryCode: string) {
  const country = countryCode.toUpperCase();
  const policy = await getCountryPolicy();

  if (policy.blockedCountries.includes(country)) {
    return false;
  }

  return policy.allowedCountries.length === 0 || policy.allowedCountries.includes(country);
}
