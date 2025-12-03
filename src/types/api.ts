// src/types/api.ts
export interface UserAPI {
  id: string;
  email: string;
  display_name?: string; // backend snake_case
  role?: string;
  avatar_url?: string;
}

// Frontend-friendly user shape (camelCase alias for convenience)
export interface User {
  id: string;
  email: string;
  display_name?: string;
  displayName?: string; // alias: prefer this in UI
  role?: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: UserAPI;
}

export interface RegisterResponse {
  access_token: string;
  user?: UserAPI;
}

export interface ProfileResponse extends UserAPI {}

export interface Theme {
  primaryColor?: string;
  mode?: 'light' | 'dark';
}

export interface Stats {
  activeResources?: number;
  cpuUsage?: number;
  uptime?: string;
  alerts?: number;
}
