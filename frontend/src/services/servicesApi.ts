import { apiClient } from './apiClient.js';
import {
  Notice,
  CampusEvent,
  Club,
  ServiceCategory,
  ServiceRequest,
  LostFoundItem,
  EmergencyContact,
  Feedback,
  Notification,
  CampusServiceDirectoryItem,
} from '../types/services.js';

function buildQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export const servicesApi = {
  // Notices
  getNotices: (params?: { category?: string; priority?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<{ notices: Notice[]; total: number; page: number; totalPages: number }>(`/notices${buildQuery(params)}`),

  getNoticeById: (id: string) => apiClient.get<{ notice: Notice }>(`/notices/${id}`),

  markNoticeAsRead: (id: string) => apiClient.post<{ message: string }>(`/notices/${id}/read`),

  // Events
  getEvents: (params?: { category?: string; status?: string; upcoming?: boolean; search?: string; page?: number; limit?: number }) =>
    apiClient.get<{ events: CampusEvent[]; total: number; page: number; totalPages: number }>(`/events${buildQuery(params)}`),

  getEventById: (id: string) => apiClient.get<{ event: CampusEvent }>(`/events/${id}`),

  registerForEvent: (id: string) => apiClient.post<{ registration: any }>(`/events/${id}/register`),

  cancelEventRegistration: (id: string) => apiClient.delete<{ message: string }>(`/events/${id}/register`),

  // Clubs
  getClubs: (params?: { category?: string; search?: string }) =>
    apiClient.get<{ clubs: Club[] }>(`/clubs${buildQuery(params)}`),

  getClubBySlug: (slug: string) => apiClient.get<{ club: Club }>(`/clubs/${slug}`),

  joinClub: (id: string) => apiClient.post<{ membership: any }>(`/clubs/${id}/join`),

  leaveClub: (id: string) => apiClient.delete<{ message: string }>(`/clubs/${id}/leave`),

  // Helpdesk
  getServiceCategories: () =>
    apiClient.get<{ categories: ServiceCategory[] }>('/services/categories'),

  getServiceDirectory: () =>
    apiClient.get<{ directory: CampusServiceDirectoryItem[] }>('/services/directory'),

  getServiceRequests: (params?: { status?: string; category?: string; priority?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<{ requests: ServiceRequest[]; total: number; page: number; totalPages: number }>(`/services/requests${buildQuery(params)}`),

  getServiceRequestById: (id: string) =>
    apiClient.get<{ request: ServiceRequest }>(`/services/requests/${id}`),

  createServiceRequest: (data: Partial<ServiceRequest>) =>
    apiClient.post<{ request: ServiceRequest }>('/services/requests', data),

  updateServiceRequestStatus: (id: string, data: { status: string; assignedTo?: string | null; assignedDepartmentId?: string | null; comment?: string }) =>
    apiClient.patch<{ request: ServiceRequest }>(`/services/requests/${id}/status`, data),

  addServiceRequestComment: (id: string, data: { content: string; isInternal?: boolean }) =>
    apiClient.post<{ comment: any }>(`/services/requests/${id}/comments`, data),

  closeServiceRequest: (id: string) =>
    apiClient.post<{ request: ServiceRequest }>(`/services/requests/${id}/close`),

  // Lost & Found
  getLostFoundItems: (params?: { type?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get<{ items: LostFoundItem[]; total: number; page: number; totalPages: number }>(`/lost-found${buildQuery(params)}`),

  getLostFoundItemById: (id: string) =>
    apiClient.get<{ item: LostFoundItem }>(`/lost-found/${id}`),

  reportLostFoundItem: (data: Partial<LostFoundItem>) =>
    apiClient.post<{ item: LostFoundItem }>('/lost-found', data),

  submitLostFoundClaim: (id: string, data: { description: string; contactInfo: string }) =>
    apiClient.post<{ claim: any }>(`/lost-found/${id}/claim`, data),

  moderateLostFoundClaim: (claimId: string, data: { status: 'APPROVED' | 'REJECTED' }) =>
    apiClient.patch<{ claim: any }>(`/lost-found/claims/${claimId}`, data),

  // Emergency
  getEmergencyContacts: () =>
    apiClient.get<{ contacts: EmergencyContact[] }>('/emergency'),

  // Feedback
  submitFeedback: (data: { targetType: string; targetId?: string; rating: number; comment: string }) =>
    apiClient.post<{ feedback: Feedback }>('/feedback', data),

  getFeedback: (params?: { targetType?: string; targetId?: string; page?: number; limit?: number }) =>
    apiClient.get<{ feedback: Feedback[]; total: number; page: number; totalPages: number }>(`/feedback${buildQuery(params)}`),

  // Notifications
  getNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ notifications: Notification[]; total: number; unreadCount: number }>(`/notifications${buildQuery(params)}`),

  getUnreadCount: () =>
    apiClient.get<{ unreadCount: number }>('/notifications/unread-count'),

  markNotificationAsRead: (id: string) =>
    apiClient.patch<{ message: string }>(`/notifications/${id}/read`),

  markAllNotificationsAsRead: () =>
    apiClient.post<{ message: string }>('/notifications/mark-all-read'),

  // Admin Operations
  adminCreateNotice: (data: any) => apiClient.post<{ notice: Notice }>('/admin/services/notices', data),
  adminUpdateNotice: (id: string, data: any) => apiClient.patch<{ notice: Notice }>(`/admin/services/notices/${id}`, data),
  adminDeleteNotice: (id: string) => apiClient.delete<{ message: string }>(`/admin/services/notices/${id}`),

  adminCreateEvent: (data: any) => apiClient.post<{ event: CampusEvent }>('/admin/services/events', data),
  adminUpdateEvent: (id: string, data: any) => apiClient.patch<{ event: CampusEvent }>(`/admin/services/events/${id}`, data),
  adminDeleteEvent: (id: string) => apiClient.delete<{ message: string }>(`/admin/services/events/${id}`),

  adminCreateClub: (data: any) => apiClient.post<{ club: Club }>('/admin/services/clubs', data),
  adminUpdateClub: (id: string, data: any) => apiClient.patch<{ club: Club }>(`/admin/services/clubs/${id}`, data),

  adminCreateEmergencyContact: (data: any) => apiClient.post<{ contact: EmergencyContact }>('/admin/services/emergency', data),
  adminUpdateEmergencyContact: (id: string, data: any) => apiClient.patch<{ contact: EmergencyContact }>(`/admin/services/emergency/${id}`, data),
  adminDeleteEmergencyContact: (id: string) => apiClient.delete<{ message: string }>(`/admin/services/emergency/${id}`),
};
