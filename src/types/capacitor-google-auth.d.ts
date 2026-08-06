declare module "@codetrix-studio/capacitor-google-auth" {
  export interface GoogleAuthOptions {
    clientId?: string;
    scopes?: string[];
    grantOfflineAccess?: boolean;
  }
  export interface GoogleUser {
    authentication: {
      idToken: string;
      accessToken?: string;
    };
    email?: string;
    familyName?: string;
    givenName?: string;
    id?: string;
    imageUrl?: string;
    name?: string;
  }
  export class GoogleAuth {
    static initialize(options?: GoogleAuthOptions): Promise<void>;
    static signIn(): Promise<GoogleUser>;
    static signOut(): Promise<void>;
    static refresh(): Promise<{ accessToken: string }>;
  }
}
