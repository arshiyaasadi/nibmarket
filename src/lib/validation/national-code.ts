import { digitsOnly } from "@/lib/normalization/digits";

/** Normalize to at most 10 English digits (Iranian national ID). */
export function normalizeNationalCode(value: string): string {
  return digitsOnly(value).slice(0, 10);
}

/**
 * Standard Iranian national-code (کد ملی) check-digit validation.
 * Rejects non-10-digit strings and trivial all-same-digit codes.
 */
export function isValidIranianNationalCode(value: string): boolean {
  const code = normalizeNationalCode(value);
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;

  const check = Number(code[9]);
  const sum = code
    .slice(0, 9)
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}
