/**
 * WhatsApp-number login form. Requests an OTP for an existing number; the
 * caller (route) navigates to the OTP screen with the returned number.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, PhoneFormInput, Button } from '@ros/ui-web';
import { useRequestOtp } from '@ros/core';
import { loginSchema, type LoginFormValues } from '@ros/utils';

export interface LoginFormProps {
  onRequested: (phoneNumber: string) => void;
}

export function LoginForm({ onRequested }: LoginFormProps) {
  const requestOtp = useRequestOtp();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_number: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await requestOtp.mutateAsync(values);
    onRequested(values.phone_number);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <PhoneFormInput
          name="phone_number"
          label="WhatsApp number"
          className="h-11 rounded-lg text-base"
          placeholder="+92 300 000 0000"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-lg text-base font-semibold"
          disabled={requestOtp.isPending}
        >
          {requestOtp.isPending ? 'Sending code…' : 'Send code'}
        </Button>

        {requestOtp.isError && (
          <p className="text-sm text-destructive">
            Couldn't send a code. Check the number and try again.
          </p>
        )}
      </form>
    </Form>
  );
}

export default LoginForm;
