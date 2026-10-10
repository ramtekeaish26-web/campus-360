import { apiClient } from './apiClient.js';
import { User } from '../types/index.js';

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export const authService = {
  async login(email: string, password: string, role?: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
      role,
    });
    apiClient.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      apiClient.setToken(null);
    }
  },
};
