import { apiClient } from './apiClient.js';
import { User } from '../types/index.js';

export const adminService = {
  async listUsers(): Promise<{ users: User[]; total: number }> {
    return apiClient.get<{ users: User[]; total: number }>('/admin/users');
  },
};
