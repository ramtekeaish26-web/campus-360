import { apiClient } from './apiClient.js';
import {
  NotificationItem,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  DailySummary,
  SmartRecommendation,
  AdminNotificationAudit,
  AdminBroadcastPreview,
} from '../types/notifications.js';

export const notificationsApi = {
  async getNotifications(params?: {
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: NotificationItem[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    quietHoursActive?: boolean;
  }> {
    const query = new URLSearchParams();
    if (params?.unreadOnly !== undefined) query.append('unreadOnly', String(params.unreadOnly));
    if (params?.type) query.append('type', params.type);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';

    return await apiClient.get(`/notifications${qs}`);
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return await apiClient.get('/notifications/unread-count');
  },

  async markAsRead(id: string): Promise<{ success: boolean; id: string }> {
    return await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return await apiClient.post('/notifications/mark-all-read');
  },

  async getPreferences(): Promise<{ preferences: NotificationPreferences }> {
    return await apiClient.get('/notifications/preferences');
  },

  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<{ preferences: NotificationPreferences }> {
    return await apiClient.put('/notifications/preferences', updates);
  },

  async getDailySummary(): Promise<DailySummary> {
    return await apiClient.get('/notifications/daily-summary');
  },

  async getRecommendations(): Promise<{ recommendations: SmartRecommendation[] }> {
    return await apiClient.get('/notifications/recommendations');
  },

  async explain(question: string): Promise<{ answer: string; notificationsReferenced: number }> {
    return await apiClient.post('/notifications/explain', { question });
  },

  async adminPreviewBroadcast(params: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetAudience: string;
    actionUrl?: string;
    actionLabel?: string;
  }): Promise<AdminBroadcastPreview> {
    return await apiClient.post('/notifications/admin/preview', params);
  },

  async adminPublishBroadcast(params: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetAudience: string;
    confirmed: boolean;
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
  }): Promise<{ success: boolean; broadcastId: string; recipientCount: number }> {
    return await apiClient.post('/notifications/admin/publish', params);
  },

  async adminGetAuditLogs(): Promise<{ auditLogs: AdminNotificationAudit[] }> {
    return await apiClient.get('/notifications/admin/audit');
  },
};
