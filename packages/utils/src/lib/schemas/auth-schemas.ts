/** Auth form validation schemas, shared across platforms. */
import { z } from 'zod';

import { isValidPhone } from '../phone/phone-number.js';

export const phoneNumberSchema = z
  .string()
  .refine(isValidPhone, 'Enter a valid WhatsApp number, e.g. +923001234567.');

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

/** Length of the OTP code entered on the verification screen. */
export const OTP_CODE_LENGTH = 6;

export const otpSchema = z.object({
  code: z
    .string()
    .regex(
      new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`),
      `Enter the ${OTP_CODE_LENGTH}-digit code sent to you.`,
    ),
});
export type OtpFormValues = z.infer<typeof otpSchema>;
