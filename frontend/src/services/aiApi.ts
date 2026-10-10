import { apiClient } from './apiClient.js';
import {
  AIChatMessage,
  AIConversationSummary,
  AIPendingAction,
  AIAuditLogEntry,
  AIStats,
} from '../types/ai.js';

export const aiApi = {
  async sendMessage(params: {
    message: string;
    conversationId?: string;
  }): Promise<{
    message: AIChatMessage;
    conversationId: string;
    pendingAction?: AIPendingAction | null;
  }> {
    return await apiClient.post<{
      message: AIChatMessage;
      conversationId: string;
      pendingAction?: AIPendingAction | null;
    }>('/ai/chat', params);
  },

  async getConversations(): Promise<AIConversationSummary[]> {
    const res = await apiClient.get<{ conversations: AIConversationSummary[] }>('/ai/conversations');
    return res.conversations;
  },

  async getConversationMessages(conversationId: string): Promise<AIChatMessage[]> {
    const res = await apiClient.get<{ messages: AIChatMessage[] }>(
      `/ai/conversations/${conversationId}/messages`
    );
    return res.messages;
  },

  async confirmAction(
    actionId: string,
    confirmed: boolean
  ): Promise<{ success: boolean; message: string; result?: any }> {
    return await apiClient.post<{ success: boolean; message: string; result?: any }>(
      `/ai/actions/${actionId}/confirm`,
      { confirmed }
    );
  },

  async getAdminLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
  }): Promise<{ logs: AIAuditLogEntry[]; total: number; page: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.userId) query.append('userId', params.userId);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return await apiClient.get<{ logs: AIAuditLogEntry[]; total: number; page: number }>(
      `/ai/admin/logs${qs}`
    );
  },

  async getAdminStats(): Promise<AIStats> {
    const res = await apiClient.get<{ stats: AIStats }>('/ai/admin/stats');
    return res.stats;
  },
};
