'use client';

import { useId, type ReactNode } from 'react';
import {
  useController,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { FieldShell } from '../form/form';
import { InputOTP } from './input-otp';

export interface OtpFormInputProps<TValues extends FieldValues = FieldValues> {
  name: FieldPath<TValues>;
  label?: string;
  maxLength: number;
  containerClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * `InputOTP` bound to react-hook-form. Reads its field from the surrounding
 * `<Form>` via `useController`; pass `name`, `maxLength`, and the slot layout
 * as `children`.
 */
export function OtpFormInput<TValues extends FieldValues = FieldValues>({
  name,
  label,
  maxLength,
  containerClassName,
  className,
  children,
}: OtpFormInputProps<TValues>) {
  const { field, fieldState } = useController<TValues>({ name });
  const id = useId();
  const error = fieldState.error?.message;
  const messageId = `${id}-message`;

  return (
    <FieldShell
      label={label}
      error={error}
      controlId={id}
      messageId={messageId}
    >
      <InputOTP
        id={id}
        name={field.name}
        maxLength={maxLength}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? messageId : undefined}
        containerClassName={containerClassName}
        className={className}
      >
        {children}
      </InputOTP>
    </FieldShell>
  );
}

export default OtpFormInput;
