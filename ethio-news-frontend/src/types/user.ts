export interface User {
  id: string;
  email: string;
  preferedLanguage: "ENG" | "AMH";
  notificationsEnabled: boolean;
  role: "ADMIN" | "USER";
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
