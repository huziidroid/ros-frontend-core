import { useAppCoreContext } from '@ros/core';
import { LoginForm } from '@ros/components-web';
import { Button } from '@ros/ui-web';

import { AuthLayout } from '../../layouts/auth-layout';

export function LoginPage() {
  const { navigationService, platformName } = useAppCoreContext();

  return (
    <AuthLayout
      title="Log in"
      description="Enter your registered WhatsApp number to get a login code."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New to {platformName}?{' '}
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

export default LoginPage;
