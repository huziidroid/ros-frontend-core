import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppCoreProvider } from '@ros/core';
import { Toaster } from '@ros/ui-web';
import { useMemo } from 'react';

import { API_HOST, PLATFORM_NAME } from './config/env';
import { ROUTES } from './routing/routes';
import { WebStorageService } from './services/storage.service';
import { WebNavigationService } from './services/navigation.service';
import { WebAlertService } from './services/alert.service';
import { GuestRoute, ProtectedRoute } from './routing/route-guards';

export function App() {
  const navigate = useNavigate();

  const storage = useMemo(() => new WebStorageService(), []);
  const alertService = useMemo(() => new WebAlertService(), []);
  const navigationService = useMemo(
    () => new WebNavigationService(navigate),
    [navigate],
  );

  const { Home, Login, Register, Otp } = ROUTES;

  return (
    <AppCoreProvider
      contextAwareness={{ experience: 'web', application: 'retail-os' }}
      baseUrl={API_HOST}
      navigationService={navigationService}
      storageService={storage}
      alertService={alertService}
      platformName={PLATFORM_NAME}
    >
      <Routes>
        {/* Protected: only for signed-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path={Home.path} element={<Home.Component />} />
        </Route>

        {/* Guest-only: signed-in users are redirected to Home */}
        <Route element={<GuestRoute />}>
          <Route path={Login.path} element={<Login.Component />} />
          <Route path={Register.path} element={<Register.Component />} />
          <Route path={Otp.path} element={<Otp.Component />} />
        </Route>
      </Routes>
      <Toaster />
    </AppCoreProvider>
  );
}

export default App;
