import { useEffect } from 'react';
import { useAppCoreContext } from '@ros/core';
import { LoginForm } from '@ros/components-web';
import { AuthLayout, Button } from '@ros/ui-web';

export function LoginRoute() {
  const { accountInfo, navigationService } = useAppCoreContext();

  useEffect(() => {
    // Already signed in — no reason to see the login screen.
    if (accountInfo.user) navigationService.replace('Home');
  }, [accountInfo.user, navigationService]);

  if (accountInfo.user) return null;

  return (
    <AuthLayout
      title="Log in"
      description="Enter your registered WhatsApp number to get a login code."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New to RetailOS?{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => navigationService.navigate('Register')}
          >
            Register your business
          </Button>
        </p>
      }
    >
      <LoginForm
        onRequested={(phoneNumber) =>
          navigationService.navigate('Otp', { phoneNumber, mode: 'login' })
        }
      />
    </AuthLayout>
  );
}

export default LoginRoute;
