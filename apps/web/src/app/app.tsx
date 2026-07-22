import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppCoreProvider } from '@ros/core';
import { Toaster } from '@ros/ui-web';
import { useMemo } from 'react';

import { API_HOST } from './config/env';
import { ROUTES } from './config/routes';
import { WebStorageService } from './services/storage.service';
import { WebNavigationService } from './services/navigation.service';
import { WebAlertService } from './services/alert.service';

export function App() {
  const navigate = useNavigate();
  const storage = useMemo(() => new WebStorageService(), []);
  const navigationService = useMemo(
    () => new WebNavigationService(navigate),
    [navigate],
  );
  const alertService = useMemo(() => new WebAlertService(), []);

  return (
    <AppCoreProvider
      contextAwareness={{ experience: 'web', application: 'retail-os' }}
      baseUrl={API_HOST}
      navigationService={navigationService}
      storageService={storage}
      alertService={alertService}
    >
      <Routes>
        {Object.values(ROUTES).map(({ path, Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
      <Toaster />
    </AppCoreProvider>
  );
}

export default App;
