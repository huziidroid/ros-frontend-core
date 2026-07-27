'use client';

import { useId, type ComponentProps } from 'react';
import {
  useController,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { FieldShell } from '../form/form';
import { Input } from './input';

export interface FormInputProps<
  TValues extends FieldValues = FieldValues,
> extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'name'> {
  name: FieldPath<TValues>;
  label?: string;
}

/**
 * `Input` bound to react-hook-form. Reads its field from the surrounding
 * `<Form>` via `useController`; pass `name` and an optional `label`.
 */
export function FormInput<TValues extends FieldValues = FieldValues>({
  name,
  label,
  ...inputProps
}: FormInputProps<TValues>) {
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
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? messageId : undefined}
        {...field}
        {...inputProps}
      />
    </FieldShell>
  );
}

export default FormInput;
