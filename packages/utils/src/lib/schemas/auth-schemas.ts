/**
 * Shared auth validation schemas — platform-agnostic so web and native forms
 * validate against the exact same rules instead of drifting apart.
 */
import { z } from 'zod';

import { E164_PATTERN } from '../phone/phone-number.js';

export const phoneNumberSchema = z
  .string()
  .regex(E164_PATTERN, 'Enter a valid WhatsApp number, e.g. +923001234567.');

export const loginSchema = z.object({
  phone_number: phoneNumberSchema,
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  business_name: z.string().min(1, 'Enter your business name.'),
  first_name: z.string().min(1, 'Enter your first name.'),
  last_name: z.string().min(1, 'Enter your last name.'),
  phone_number: phoneNumberSchema,
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
