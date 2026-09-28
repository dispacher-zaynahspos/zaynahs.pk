/**
 * Pakistan phone number utilities — shared by client (PhoneInput) and server
 * (order/lead validation). No external deps; small custom util per project rules.
 *
 * Canonical forms:
 *   national: 03XXXXXXXXX          (11 digits, mobile)
 *   E.164:    +923XXXXXXXXX        (13 chars)
 *
 * Valid PK mobile prefixes are 030x–034x (Jazz/Warid/Zong/Ufone/Telenor/SCOM),
 * so the national number always matches ^03[0-4]\d{8}$.
 */

/** Strip everything except digits. */
export function digitsOnly(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(/\D/g, '');
}

/**
 * Normalize any user input into the canonical national form `03XXXXXXXXX`.
 * Handles +92 / 0092 / 92 prefixes, missing leading 0, spaces/dashes/brackets.
 * Returns as many normalized digits as available (may be partial while typing).
 */
export function normalizePkPhone(input: string | null | undefined): string {
  let clean = digitsOnly(input);
  if (!clean) return '';

  // 0092... -> 92...
  if (clean.startsWith('00')) clean = clean.slice(2);

  // 92 0 3.. (e.g. 9203001234567) -> strip country code + rejoin national
  if (clean.startsWith('920') && clean.length >= 4) {
    clean = clean.slice(2); // -> 03...
  } else if (clean.startsWith('92') && clean.length >= 4) {
    // 923001234567 -> 03001234567
    clean = '0' + clean.slice(2);
  } else if (clean.startsWith('3')) {
    // missing leading zero: 3001234567 -> 03001234567
    clean = '0' + clean;
  }

  // Cap at national length (11 digits)
  return clean.slice(0, 11);
}

/** True if the input is a complete, valid PK mobile number. */
export function isValidPkMobile(input: string | null | undefined): boolean {
  const national = normalizePkPhone(input);
  return /^03[0-4]\d{8}$/.test(national);
}

/** Convert to E.164 (`+923XXXXXXXXX`). Returns '' if not a valid mobile. */
export function toE164Pk(input: string | null | undefined): string {
  const national = normalizePkPhone(input);
  if (!/^03[0-4]\d{8}$/.test(national)) return '';
  return '+92' + national.slice(1);
}

/**
 * Live display formatting: groups as "0300 1234567" (4 + 7).
 * Accepts partial input; only formats the digits present.
 */
export function formatPkPhone(input: string | null | undefined): string {
  const national = normalizePkPhone(input);
  if (national.length <= 4) return national;
  return national.slice(0, 4) + ' ' + national.slice(4);
}

/** Total digits entered toward the 11-digit national target (for counters/dots). */
export function pkPhoneProgress(input: string | null | undefined): { filled: number; total: number } {
  return { filled: normalizePkPhone(input).length, total: 11 };
}

export const PK_PHONE_MAX_DIGITS = 11;
