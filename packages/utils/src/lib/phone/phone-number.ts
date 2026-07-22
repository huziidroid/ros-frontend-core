/**
 * WhatsApp/E.164 phone number helpers, shared between form validation and
 * input formatting. Mirrors the backend's regex (ros-be-service
 * `app/schemas/auth/otp.py`) so client and server never disagree.
 */

export const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

/** Digits only, leading zero dropped (E.164 never starts with 0), capped at 15. */
export function digitsOnly(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/^0+/, '')
    .slice(0, 15);
}

/** Raw input -> E.164 string, e.g. "0923 001 234 567" -> "+923001234567". */
export function toE164(value: string): string {
  const digits = digitsOnly(value);
  return digits ? `+${digits}` : '';
}

/** E.164 (or partial) -> spaced display string, e.g. "+923001234567" -> "+923 001 234 567". */
export function formatPhoneNumber(value: string): string {
  const digits = digitsOnly(value);
  if (!digits) return '';
  const groups = digits.match(/.{1,3}/g) ?? [];
  return `+${groups.join(' ')}`;
}
