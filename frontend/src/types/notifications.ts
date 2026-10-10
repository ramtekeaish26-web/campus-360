export type NotificationType =
  | 'ACADEMIC'
  | 'EVENT'
  | 'NOTICE'
  | 'SERVICE_REQUEST'
  | 'LOST_FOUND'
  | 'CAMPUS'
  | 'SYSTEM'
  | 'SECURITY'
  | 'REMINDER';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  expiresAt?: string | null;
}

export interface NotificationPreferences {
  userId: string;
  academicEnabled: boolean;
  eventsEnabled: boolean;
  noticesEnabled: boolean;
  servicesEnabled: boolean;
  campusEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface DailySummary {
  greeting: string;
  summaryText: string;
  classesToday: number;
  pendingDeadlines: number;
  registeredEvents: number;
  unreadNotices: number;
  highlights: string[];
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'SCHEDULE' | 'ACADEMIC' | 'SERVICES' | 'LOCATION';
  actionUrl?: string;
  actionLabel?: string;
  priority: 'NORMAL' | 'HIGH';
}

export interface AdminNotificationAudit {
  id: string;
  adminId: string;
  adminEmail: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: string;
  recipientCount: number;
  publishedAt: string;
  expiresAt?: string | null;
}

export interface AdminBroadcastPreview {
  preview: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetAudience: string;
    actionUrl?: string | null;
    actionLabel?: string | null;
    estimatedRecipients: number;
  };
  readyToPublish: boolean;
}
