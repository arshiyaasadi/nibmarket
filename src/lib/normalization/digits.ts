const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(char);
    if (persianIndex >= 0) return String(persianIndex);

    const arabicIndex = ARABIC_DIGITS.indexOf(char);
    return arabicIndex >= 0 ? String(arabicIndex) : char;
  });
}

export function digitsOnly(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}

export function normalizeMobile(value: string): string {
  return digitsOnly(value).slice(0, 11);
}

export function normalizeOtp(value: string): string {
  return digitsOnly(value).slice(0, 4);
}

export function normalizeDecimalInput(value: string): string {
  const normalized = toEnglishDigits(value)
    .replace(/[٬,]/g, ".")
    .replace(/[^\d.]/g, "");
  const [head, ...tail] = normalized.split(".");
  return tail.length > 0 ? `${head}.${tail.join("")}` : head;
}

export function normalizeSearchInput(value: string): string {
  return toEnglishDigits(value).trim();
}
