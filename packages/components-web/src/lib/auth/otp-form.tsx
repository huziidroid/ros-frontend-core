/**
 * 6-digit OTP entry + verification. `resendPayload` carries whatever
 * `OtpRequestBody` the caller originally sent (login: phone only, register:
 * phone + business fields) so a resend reissues the same request.
 */
import { useEffect, useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Button,
} from '@ros/ui-web';
import { useRequestOtp, useVerifyOtp, useAppCoreContext } from '@ros/core';
import { AlertVariant, type OtpRequestBody } from '@ros/types';
import { formatPhoneNumber } from '@ros/utils';

const RESEND_COOLDOWN_SECONDS = 30;

export interface OtpFormProps {
  phoneNumber: string;
  resendPayload: OtpRequestBody;
  onVerified: () => void;
}

export function OtpForm({ phoneNumber, resendPayload, onVerified }: OtpFormProps) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();
  const { alertService } = useAppCoreContext();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    await verifyOtp.mutateAsync({ phone_number: phoneNumber, code });
    onVerified();
  };

  const handleResend = async () => {
    await requestOtp.mutateAsync(resendPayload);
    setCode('');
    setCooldown(RESEND_COOLDOWN_SECONDS);
    alertService.show({ message: 'Code resent.', variant: AlertVariant.Success });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">
        Sent via WhatsApp to <span className="font-medium text-foreground">{formatPhoneNumber(phoneNumber)}</span>.
      </p>
      <InputOTP maxLength={6} value={code} onChange={setCode}>
        <InputOTPGroup>
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={0}
          />
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={1}
          />
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={2}
          />
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={3}
          />
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={4}
          />
          <InputOTPSlot
            className="h-12 w-12 text-lg font-semibold first:rounded-l-lg last:rounded-r-lg"
            index={5}
          />
        </InputOTPGroup>
      </InputOTP>
      <Button
        size="lg"
        className="w-full rounded-lg text-base font-semibold"
        disabled={code.length < 6 || verifyOtp.isPending}
        onClick={handleVerify}
      >
        {verifyOtp.isPending ? 'Verifying…' : 'Verify'}
      </Button>
      {verifyOtp.isError && (
        <p className="text-sm text-destructive">That code didn't work. Try again.</p>
      )}
      <Button
        variant="link"
        disabled={cooldown > 0 || requestOtp.isPending}
        onClick={handleResend}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </Button>
    </div>
  );
}

export default OtpForm;
