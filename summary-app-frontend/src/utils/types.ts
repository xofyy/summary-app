// Types for API calls
export interface User {
  id: string;
  email: string;
  interests: string[];
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  interests?: string[];
}

export interface SummaryResult {
  summary: string;
  keywords: string[];
}