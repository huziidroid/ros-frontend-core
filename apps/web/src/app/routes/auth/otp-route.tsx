import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppCoreContext } from '@ros/core';
import { OtpForm } from '@ros/components-web';
import { AuthLayout } from '@ros/ui-web';
import type { RootParamList } from '@ros/types';

export function OtpRoute() {
  const { navigationService } = useAppCoreContext();
  const location = useLocation();
  const params = location.state as RootParamList['Otp'] | null;

  useEffect(() => {
    // No context to verify against (e.g. a direct link/refresh) — bounce back
    // to the start of the flow rather than rendering a broken screen.
    if (!params) navigationService.replace('Login');
  }, [params, navigationService]);

  if (!params) return null;

  return (
    <AuthLayout
      title="Enter the code"
      onBack={() =>
        navigationService.replace(
          params.mode === 'register' ? 'Register' : 'Login',
        )
      }
    >
      <OtpForm
        phoneNumber={params.phoneNumber}
        resendPayload={{
          phone_number: params.phoneNumber,
          business_name: params.businessName,
          first_name: params.firstName,
          last_name: params.lastName,
        }}
        onVerified={() => navigationService.replace('Home')}
      />
    </AuthLayout>
  );
}

export default OtpRoute;
