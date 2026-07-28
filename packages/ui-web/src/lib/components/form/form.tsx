'use client';

import type { ReactNode } from 'react';

import { cn } from '../../utils';
import { Label } from '../label/label';

export { FormProvider as Form } from 'react-hook-form';

export interface FieldShellProps {
  /** Field label; when omitted no label is rendered (e.g. the OTP field). */
  label?: ReactNode;
  /** Resolved validation message, if any. */
  error?: string;
  /** id of the control this shell labels — links `<label htmlFor>`. */
  controlId: string;
  /** id applied to the error node — target of the control's aria-describedby. */
  messageId: string;
  /** The control itself (an input, phone input, OTP group, …). */
  children: ReactNode;
  className?: string;
}

/**
 * Presentational field layout: label, control, then validation message. Takes
 * the resolved error and element ids as props.
 */
export function FieldShell({
  label,
  error,
  controlId,
  messageId,
  children,
  className,
}: FieldShellProps) {
  return (
    <div data-slot="form-item" className={cn('grid gap-2', className)}>
      {label && (
        <Label
          htmlFor={controlId}
          data-error={!!error}
          className="data-[error=true]:text-destructive"
        >
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p id={messageId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
