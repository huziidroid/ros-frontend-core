/**
 * Route guards used as layout routes: render `<Outlet />` when access is
 * allowed, otherwise redirect with `<Navigate replace />`.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAppCoreContext } from '@ros/core';

import { ROUTES } from './routes';

/** Requires a signed-in user; signed-out visitors are sent to Login. */
export function ProtectedRoute() {
  const { accountInfo } = useAppCoreContext();
  return accountInfo.user ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.Login.path} replace />
  );
}

/** Signed-out only; a signed-in user is sent to Home. */
export function GuestRoute() {
  const { accountInfo } = useAppCoreContext();
  return accountInfo.user ? (
    <Navigate to={ROUTES.Home.path} replace />
  ) : (
    <Outlet />
  );
}
