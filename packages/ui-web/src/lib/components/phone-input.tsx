/**
 * Formats a WhatsApp/phone number as the user types (spaced groups) while
 * keeping the underlying field value a clean E.164 string.
 */
import { forwardRef } from 'react';
import type { ChangeEvent, ComponentProps } from 'react';
import { formatPhoneNumber, toE164 } from '@ros/utils';

import { Input } from './ui/input';

export interface PhoneInputProps
  extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      type="tel"
      inputMode="tel"
      value={formatPhoneNumber(value)}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange?.(toE164(event.target.value))
      }
    />
  ),
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
