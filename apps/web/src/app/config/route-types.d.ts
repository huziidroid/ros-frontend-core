/** App route registry. Add an entry here per route defined in `./routes.ts`. */
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
