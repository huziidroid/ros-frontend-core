/**
 * Route registry: pairs each route's path pattern (for `<Route>`) with a
 * `toPath` builder (for `navigationService`). Add param shapes to
 * `RootParamList` in `./route-types.d.ts`, then an entry here.
 */
import type { ComponentType } from 'react';
import type { RootParamList, RouteArgs } from '@ros/types';

import { HomeRoute } from '../routes/home/home-route';
import { LoginRoute } from '../routes/auth/login-route';
import { RegisterRoute } from '../routes/auth/register-route';
import { OtpRoute } from '../routes/auth/otp-route';

interface RouteConfig {
  /** react-router pattern, e.g. `/orders/:orderId`. */
  path: string;
  Component: ComponentType;
  /** Builds a concrete path from this route's params (see `RootParamList`). */
  toPath: (params?: unknown) => string;
}

export const ROUTES = {
  Home: {
    path: '/',
    Component: HomeRoute,
    toPath: () => '/',
  },
  Login: {
    path: '/login',
    Component: LoginRoute,
    toPath: () => '/login',
  },
  Register: {
    path: '/register',
    Component: RegisterRoute,
    toPath: () => '/register',
  },
  Otp: {
    // Params travel via router state (see WebNavigationService), not the URL —
    // the phone number shouldn't sit in the address bar or browser history.
    path: '/otp',
    Component: OtpRoute,
    toPath: () => '/otp',
  },
} satisfies Record<keyof RootParamList, RouteConfig>;

/** Resolve a route name + params to a concrete path, per `ROUTES[name].toPath`. */
export function buildPath<Name extends keyof RootParamList>(
  name: Name,
  args: RouteArgs<Name>,
): string {
  const toPath = ROUTES[name].toPath as (params?: unknown) => string;
  return toPath(args[0]);
}
