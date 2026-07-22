/**
 * Navigation port. Routes are addressed by name against an app-augmented
 * `RootParamList`, not by URL path, so it type-checks against react-router
 * (web) and React Navigation (native) alike.
 *
 * Apps register routes via declaration merging:
 * ```ts
 * declare module '@ros/types' {
 *   interface RootParamList {
 *     Home: undefined;
 *     OrderDetails: { orderId: string };
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface RootParamList {
  // Populated per-app via declaration merging.
}

/** Arg tuple for a route: omit-able when its params type is `undefined`. */
export type RouteArgs<Name extends keyof RootParamList> =
  undefined extends RootParamList[Name]
    ? [params?: RootParamList[Name]]
    : [params: RootParamList[Name]];

export interface NavigationService {
  /** Push a named route onto the stack/history. */
  navigate<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void;
  /** Pop the current route. */
  goBack(): void;
  /** Whether `goBack` has anywhere to go. */
  canGoBack(): boolean;
  /** Swap the current route without adding a history entry. */
  replace<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void;
  /** Clear history/stack and navigate to a route. */
  reset<Name extends keyof RootParamList>(
    name: Name,
    ...args: RouteArgs<Name>
  ): void;
}

/** Native-only drawer control. Intersect with `NavigationService` where needed. */
export interface DrawerNavigation {
  openDrawer(): void;
  closeDrawer(): void;
  toggleDrawer(): void;
}

/** Native-only tab control. Intersect with `NavigationService` where needed. */
export interface TabNavigation {
  switchTab(name: string): void;
}
