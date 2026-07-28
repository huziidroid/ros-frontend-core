'use client';

import { useId, type ComponentProps } from 'react';
import {
  useController,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { FieldShell } from '../form/form';
import { PhoneInput } from './phone-input';

export interface PhoneFormInputProps<
  TValues extends FieldValues = FieldValues,
> extends Omit<
  ComponentProps<typeof PhoneInput>,
  'value' | 'onChange' | 'name'
> {
  name: FieldPath<TValues>;
  label?: string;
}

/**
 * `PhoneInput` bound to react-hook-form. Reads its field from the surrounding
 * `<Form>` via `useController`; pass `name` and an optional `label`.
 */
export function PhoneFormInput<TValues extends FieldValues = FieldValues>({
  name,
  label,
  ...inputProps
}: PhoneFormInputProps<TValues>) {
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
      <PhoneInput
        id={id}
        name={field.name}
        ref={field.ref}
        aria-invalid={!!error}
        aria-describedby={error ? messageId : undefined}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        {...inputProps}
      />
    </FieldShell>
  );
}

export default PhoneFormInput;
