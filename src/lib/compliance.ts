export function getAllowedCountries() {
  return (process.env.ALLOWED_COUNTRIES ?? "US,CA,GB,FR,MA")
    .split(",")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

export function isCountryAllowed(countryCode: string) {
  const allowedCountries = getAllowedCountries();
  return allowedCountries.length === 0 || allowedCountries.includes(countryCode.toUpperCase());
}

export function isAdult(dateOfBirth: Date, minimumAge = 18) {
  const today = new Date();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate()
  );
  let age = today.getFullYear() - dateOfBirth.getFullYear();

  if (birthdayThisYear > today) {
    age -= 1;
  }

  return age >= minimumAge;
}
