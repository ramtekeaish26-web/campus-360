import { apiClient } from './apiClient.js';
import { User } from '../types/index.js';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export const userService = {
  async getMe(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/users/me');
  },

  async updateMe(payload: UpdateProfilePayload): Promise<{ user: User }> {
    return apiClient.patch<{ user: User }>('/users/me', payload);
  },
};
