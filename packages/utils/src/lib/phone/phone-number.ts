/**
 * Phone number helpers backed by libphonenumber-js: normalize to E.164, format
 * for display, and validate.
 */
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';

/** Digits only, leading zeros dropped, capped at the E.164 maximum of 15. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 15);
}

/** Raw input -> E.164 string, e.g. "0923 001 234 567" -> "+923001234567". */
export function toE164(value: string): string {
  const digits = digitsOnly(value);
  return digits ? `+${digits}` : '';
}

/** Format a number (complete or partial) for display, e.g. "+92 300 1234567". */
export function formatPhoneNumber(value: string): string {
  return new AsYouType().input(toE164(value));
}

/** True when `value` is a real, dial-able phone number. */
export function isValidPhone(value: string): boolean {
  return isValidPhoneNumber(toE164(value));
}
