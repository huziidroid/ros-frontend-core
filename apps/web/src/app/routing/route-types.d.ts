/** Route parameter shapes, keyed by route name. */
export {};

declare module '@ros/types' {
  interface RootParamList {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    Otp: {
      phoneNumber: string;
      mode: 'login' | 'register';
      businessName?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
