import { Navigate, useLocation } from 'react-router-dom';
import { useAppCoreContext } from '@ros/core';
import { OtpForm } from '@ros/components-web';
import type { RootParamList } from '@ros/types';

import { AuthLayout } from '../../layouts/auth-layout';

export function OtpPage() {
  const { navigationService } = useAppCoreContext();
  const location = useLocation();
  const params = location.state as RootParamList['Otp'] | null;

  // Redirect to the start of the flow when opened without navigation state.
  if (!params) return <Navigate to="/login" replace />;

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

export default OtpPage;
