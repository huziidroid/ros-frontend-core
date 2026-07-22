/** Web `NavigationService`, backed by react-router. */
import type { NavigateFunction } from 'react-router-dom';
import type { NavigationService, RootParamList, RouteArgs } from '@ros/types';

import { buildPath } from '../config/routes';

export class WebNavigationService implements NavigationService {
  constructor(private readonly routerNavigate: NavigateFunction) {}

  navigate<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void {
    this.routerNavigate(buildPath(name, args), { state: args[0] });
  }

  goBack(): void {
    this.routerNavigate(-1);
  }

  canGoBack(): boolean {
    // No direct API in react-router v6; history length is the closest signal.
    return window.history.length > 1;
  }

  replace<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void {
    this.routerNavigate(buildPath(name, args), {
      replace: true,
      state: args[0],
    });
  }

  reset<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void {
    // No stack to clear on web; replace is the closest analog.
    this.routerNavigate(buildPath(name, args), {
      replace: true,
      state: args[0],
    });
  }
}
