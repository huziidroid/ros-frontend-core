/**
 * Business registration form. Requests an OTP for a new number, carrying the
 * business/name fields along (see `OtpRequestBody`) so `verify_otp` can
 * create the tenant + owner user on first verification.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormInput, PhoneFormInput, Button } from '@ros/ui-web';
import { useRequestOtp } from '@ros/core';
import { registerSchema, type RegisterFormValues } from '@ros/utils';

export interface RegisterFormProps {
  onRequested: (values: RegisterFormValues) => void;
}

export function RegisterForm({ onRequested }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      business_name: '',
      first_name: '',
      last_name: '',
      phone_number: '',
    },
  });
  const requestOtp = useRequestOtp();

  const onSubmit = form.handleSubmit(async (values) => {
    await requestOtp.mutateAsync(values);
    onRequested(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormInput
          name="business_name"
          label="Business name"
          className="h-11 rounded-lg text-base"
          placeholder="Rana Traders"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="first_name"
            label="First name"
            className="h-11 rounded-lg text-base"
            placeholder="Rana"
          />
          <FormInput
            name="last_name"
            label="Last name"
            className="h-11 rounded-lg text-base"
            placeholder="Ahmed"
          />
        </div>
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
          {requestOtp.isPending ? 'Sending code…' : 'Continue'}
        </Button>
        {requestOtp.isError && (
          <p className="text-sm text-destructive">
            Couldn't send a code. Check the details and try again.
          </p>
        )}
      </form>
    </Form>
  );
}

export default RegisterForm;
