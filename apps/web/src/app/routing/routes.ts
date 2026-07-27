/**
 * Route registry: maps each route to its path pattern (for `<Route>`) and a
 * `toPath` builder (for `navigationService`).
 */
import type { ComponentType } from 'react';
import type { RootParamList, RouteArgs } from '@ros/types';

import { HomePage } from '../pages/home/home-page';
import { LoginPage } from '../pages/auth/login-page';
import { RegisterPage } from '../pages/auth/register-page';
import { OtpPage } from '../pages/auth/otp-page';

/**
 * A route's config, including its path pattern, component, and `toPath` builder.
 */
interface RouteConfig {
  path: string;
  Component: ComponentType;
  toPath: (params?: unknown) => string;
}

export const ROUTES = {
  Home: {
    path: '/',
    Component: HomePage,
    toPath: () => '/',
  },
  Login: {
    path: '/login',
    Component: LoginPage,
    toPath: () => '/login',
  },
  Register: {
    path: '/register',
    Component: RegisterPage,
    toPath: () => '/register',
  },
  Otp: {
    path: '/otp',
    Component: OtpPage,
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
