import { apiClient } from './apiClient.js';
import {
  AnalyticsSummaryResponse,
  AIExplanationResponse,
  TimeRangePeriod,
} from '../types/analytics.js';

export const analyticsApi = {
  async getSummary(params?: {
    period?: TimeRangePeriod;
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsSummaryResponse> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return await apiClient.get<AnalyticsSummaryResponse>(`/analytics/summary${qs}`);
  },

  async explain(question: string): Promise<AIExplanationResponse> {
    return await apiClient.post<AIExplanationResponse>('/analytics/explain', {
      question,
    });
  },

  async exportCsv(period: TimeRangePeriod = '30d'): Promise<Blob> {
    const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/analytics/export?period=${period}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV analytics');
    }

    return await response.blob();
  },
};
