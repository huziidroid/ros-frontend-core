/**
 * OTP entry and verification. `resendPayload` is the `OtpRequestBody` used to
 * request the code, replayed on resend. The code is validated against
 * `otpSchema` (exactly `OTP_CODE_LENGTH` digits).
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  OtpFormInput,
  InputOTPGroup,
  InputOTPSlot,
  Button,
} from '@ros/ui-web';
import { useRequestOtp, useVerifyOtp, useAppCoreContext } from '@ros/core';
import { AlertVariant, type OtpRequestBody } from '@ros/types';
import {
  formatPhoneNumber,
  otpSchema,
  OTP_CODE_LENGTH,
  type OtpFormValues,
} from '@ros/utils';

const RESEND_COOLDOWN_SECONDS = 30;

const SLOT_CLASS =
  'h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg';

export interface OtpFormProps {
  phoneNumber: string;
  resendPayload: OtpRequestBody;
  onVerified: () => void;
}

export function OtpForm({
  phoneNumber,
  resendPayload,
  onVerified,
}: OtpFormProps) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();
  const { alertService } = useAppCoreContext();

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = form.handleSubmit(async ({ code }) => {
    await verifyOtp.mutateAsync({ phone_number: phoneNumber, code });
    onVerified();
  });

  const handleResend = async () => {
    await requestOtp.mutateAsync(resendPayload);
    form.reset({ code: '' });
    setCooldown(RESEND_COOLDOWN_SECONDS);
    alertService.show({
      message: 'Code resent.',
      variant: AlertVariant.Success,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleVerify}
        className="flex flex-col items-center gap-5"
      >
        <p className="text-center text-sm text-muted-foreground">
          Sent via WhatsApp to{' '}
          <span className="font-medium text-foreground">
            {formatPhoneNumber(phoneNumber)}
          </span>
          .
        </p>
        <OtpFormInput name="code" maxLength={OTP_CODE_LENGTH}>
          <InputOTPGroup>
            {Array.from({ length: OTP_CODE_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} className={SLOT_CLASS} index={index} />
            ))}
          </InputOTPGroup>
        </OtpFormInput>
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-lg text-base font-semibold"
          disabled={!form.formState.isValid || verifyOtp.isPending}
        >
          {verifyOtp.isPending ? 'Verifying…' : 'Verify'}
        </Button>
        {verifyOtp.isError && (
          <p className="text-sm text-destructive">
            That code didn't work. Try again.
          </p>
        )}
        <Button
          type="button"
          variant="link"
          disabled={cooldown > 0 || requestOtp.isPending}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Button>
      </form>
    </Form>
  );
}

export default OtpForm;
