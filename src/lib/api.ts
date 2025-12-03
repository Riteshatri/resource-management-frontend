// src/lib/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { LoginResponse, RegisterResponse, ProfileResponse } from '@/types/api';

// Use relative URLs - routes to same server regardless of hostname/proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || "/",
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login/signup errors - let the component handle it
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || 
                             error.config?.url?.includes('/api/auth/signup');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

function unwrap<T>(res: any): T {
  return res?.data ?? res;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const body = { email, username: email, password };
    const res = await apiClient.post('/api/auth/login', body);
    return unwrap<LoginResponse>(res);
  },

  // register supports (email,password,displayName) signature
  register: async (email: string, password: string, displayName?: string): Promise<RegisterResponse> => {
    const payload: any = {
      email,
      username: email,
      password,
    };
    if (displayName) payload.display_name = displayName;
    const res = await apiClient.post('/api/auth/signup', payload);
    return unwrap<RegisterResponse>(res);
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // Profile
  getProfile: async (): Promise<ProfileResponse> => {
    const res = await apiClient.get('/api/users/me');
    return unwrap<ProfileResponse>(res);
  },

  // Update profile (frontend sends camelCase; we normalize to snake_case)
  updateProfile: async (data: { displayName?: string; bio?: string; avatarUrl?: string }) => {
    const payload: any = { ...data };
    if (payload.displayName && !payload.display_name) {
      payload.display_name = payload.displayName;
      delete payload.displayName;
    }
    if (payload.avatarUrl && !payload.avatar_url) {
      payload.avatar_url = payload.avatarUrl;
      delete payload.avatarUrl;
    }
    const res = await apiClient.patch('/api/users/me', payload);
    return unwrap(res);
  },

  // Update user profile with tagline
  updateUserProfile: async (data: { display_name?: string; tagline?: string; bio?: string }) => {
    const res = await apiClient.patch('/api/users/me', data);
    return unwrap(res);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/api/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  // Users Management (Admin only)
  getUsers: async (): Promise<any[]> => {
    const res = await apiClient.get('/api/users/');
    return unwrap<any[]>(res);
  },

  resetUserPassword: async (userId: string, newPassword: string) => {
    const res = await apiClient.post(`/api/users/${userId}/reset-password`, {
      new_password: newPassword
    });
    return unwrap(res);
  },

  // Theme - now returns user-specific theme object directly
  getTheme: async (): Promise<any> => {
    const res = await apiClient.get('/api/theme/');
    // Backend now returns raw theme object (not wrapped in config_value)
    return unwrap(res);
  },

  updateTheme: async (theme: any) => {
    // Backend accepts raw theme object and saves per-user
    const res = await apiClient.put('/api/theme/', theme);
    return unwrap(res);
  },

  // Admin - User Management
  getAllUsers: async () => {
    const res = await apiClient.get('/api/admin/users');
    return unwrap<any[]>(res);
  },

  updateUserRole: async (userId: string, role: string) => {
    const res = await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
    return unwrap(res);
  },

  deleteUser: async (userId: string) => {
    const res = await apiClient.delete(`/api/admin/users/${userId}`);
    return unwrap(res);
  },

  // Resources / stats
  getResources: async () => {
    const res = await apiClient.get('/api/resources/');
    return unwrap(res);
  },

  seedTemplateResources: async () => {
    const res = await apiClient.post('/api/resources/seed/templates');
    return unwrap(res);
  },

  getTemplates: async () => {
    const res = await apiClient.get('/api/resources/templates');
    return unwrap(res);
  },

  importTemplates: async (templateIds: number[]) => {
    const res = await apiClient.post('/api/resources/import-templates', templateIds);
    return unwrap(res);
  },

  createResource: async (data: any) => {
    const res = await apiClient.post('/api/resources/', data);
    return unwrap(res);
  },

  updateResource: async (id: number, data: any) => {
    const res = await apiClient.put(`/api/resources/${id}`, data);
    return unwrap(res);
  },

  deleteResource: async (id: number) => {
    const res = await apiClient.delete(`/api/resources/${id}`);
    return unwrap(res);
  },
};

export default apiClient;
