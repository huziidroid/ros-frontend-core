import { useEffect } from 'react';
import { useAppCoreContext } from '@ros/core';
import { RegisterForm } from '@ros/components-web';
import { AuthLayout, Button } from '@ros/ui-web';

export function RegisterRoute() {
  const { accountInfo, navigationService } = useAppCoreContext();

  useEffect(() => {
    // Already signed in — no reason to see the register screen.
    if (accountInfo.user) navigationService.replace('Home');
  }, [accountInfo.user, navigationService]);

  if (accountInfo.user) return null;

  return (
    <AuthLayout
      title="Register your business"
      description="We'll verify your WhatsApp number to set up your login."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already using RetailOS?{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => navigationService.navigate('Login')}
          >
            Log in
          </Button>
        </p>
      }
    >
      <RegisterForm
        onRequested={(values) =>
          navigationService.navigate('Otp', {
            phoneNumber: values.phone_number,
            mode: 'register',
            businessName: values.business_name,
            firstName: values.first_name,
            lastName: values.last_name,
          })
        }
      />
    </AuthLayout>
  );
}

export default RegisterRoute;
