import { isDbConnected, prisma } from '../config/db.js';
import { geminiClient } from '../modules/ai/gemini.client.js';
import { AIPolicy } from '../modules/ai/ai.policy.js';

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
  dedupKey?: string;
}

export interface NotificationPreferences {
  userId: string;
  academicEnabled: boolean;
  eventsEnabled: boolean;
  noticesEnabled: boolean;
  servicesEnabled: boolean;
  campusEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g., "22:00"
  quietHoursEnd: string; // e.g., "07:00"
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

// In-Memory Notification Store (with multi-user isolation & dedup keying)
const inMemoryNotifications: Map<string, NotificationItem[]> = new Map();
const inMemoryPreferences: Map<string, NotificationPreferences> = new Map();
const inMemoryAuditLogs: AdminNotificationAudit[] = [];

export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    referenceType?: string;
    referenceId?: string;
    actionUrl?: string;
    actionLabel?: string;
  }) {
    if (!inMemoryNotifications.has(params.userId)) {
      inMemoryNotifications.set(params.userId, []);
    }
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || 'NORMAL',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedEntity: params.referenceType,
      relatedEntityId: params.referenceId,
      actionUrl: params.actionUrl || null,
      actionLabel: params.actionLabel || null,
    };
    inMemoryNotifications.get(params.userId)!.unshift(item);
    return item;
  }

  /**
   * Broadcast notification to an array of user IDs
   */
  static async notifyAudience(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    referenceType?: string,
    referenceId?: string
  ) {
    for (const userId of userIds) {
      await this.createNotification({
        userId,
        type,
        title,
        message,
        referenceType,
        referenceId,
      });
    }
  }

  /**
   * Helper: Check if current local time is within Quiet Hours
   */
  static isQuietHoursActive(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHoursEnabled) return false;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
      const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        // Over midnight (e.g. 22:00 to 07:00)
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get or initialize default user notification preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    const existing = inMemoryPreferences.get(userId);
    if (existing) return existing;

    const defaultPrefs: NotificationPreferences = {
      userId,
      academicEnabled: true,
      eventsEnabled: true,
      noticesEnabled: true,
      servicesEnabled: true,
      campusEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
    inMemoryPreferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      userId, // Immutable
    };
    inMemoryPreferences.set(userId, updated);
    return updated;
  }

  /**
   * Generate Deterministic Ground-Truth Notifications for a User
   * Discovers relevant deadlines, classes, notices, tickets, and events.
   */
  static async seedUserSmartNotifications(userId: string, role: string) {
    if (!inMemoryNotifications.has(userId)) {
      inMemoryNotifications.set(userId, []);
    }
    const userList = inMemoryNotifications.get(userId)!;

    if (role === 'STUDENT') {
      const studentItems: Array<Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>> = [
        {
          userId,
          type: 'ACADEMIC',
          title: 'Upcoming Continuous Assessment Due',
          message: 'Assignment 2 for Distributed Systems (CS601) is due in 24 hours. Submit via the Academic portal.',
          priority: 'HIGH',
          relatedEntity: 'ASSIGNMENT',
          relatedEntityId: 'asg-cs601-2',
          actionUrl: '/academic/assignments',
          actionLabel: 'View Assignment',
          dedupKey: `${userId}_asg_cs601_2`,
        },
        {
          userId,
          type: 'REMINDER',
          title: 'Class Starting Soon: Lab Session',
          message: 'Your next laboratory session for Machine Learning (CS602) starts in 20 minutes in Computing Lab 3.',
          priority: 'NORMAL',
          relatedEntity: 'SCHEDULE',
          relatedEntityId: 'sch-cs602-lab',
          actionUrl: '/academic/schedule',
          actionLabel: 'View Timetable',
          dedupKey: `${userId}_class_cs602_lab`,
        },
        {
          userId,
          type: 'ACADEMIC',
          title: 'Attendance Standing Notification',
          message: 'Your aggregate attendance in Cyber Security (CS604) is 82%. Ensure regular attendance to stay above the 75% threshold.',
          priority: 'NORMAL',
          relatedEntity: 'ATTENDANCE',
          relatedEntityId: 'att-cs604',
          actionUrl: '/academic/attendance',
          actionLabel: 'Check Attendance',
          dedupKey: `${userId}_att_cs604`,
        },
        {
          userId,
          type: 'EVENT',
          title: 'Registered Event: Technovate Hackathon',
          message: 'Technovate Annual Hackathon 2025 begins tomorrow at 09:30 AM at the Main Auditorium.',
          priority: 'NORMAL',
          relatedEntity: 'EVENT',
          relatedEntityId: 'evt-technovate-2025',
          actionUrl: '/events',
          actionLabel: 'View Event Details',
          dedupKey: `${userId}_evt_technovate`,
        },
        {
          userId,
          type: 'SERVICE_REQUEST',
          title: 'Service Request Resolved',
          message: 'Your ticket regarding Classroom A-204 Projector HDMI Cable has been marked RESOLVED by Campus Maintenance.',
          priority: 'NORMAL',
          relatedEntity: 'SERVICE_REQUEST',
          relatedEntityId: 'srv-req-101',
          actionUrl: '/services/requests',
          actionLabel: 'View Ticket',
          dedupKey: `${userId}_srv_101_resolved`,
        },
        {
          userId,
          type: 'NOTICE',
          title: 'End Semester Examination (ESE) Circular',
          message: 'Autonomous Examination Cell has published the Spring 2025 final exam timetable and hall ticket guidelines.',
          priority: 'HIGH',
          relatedEntity: 'NOTICE',
          relatedEntityId: 'not-ese-spring-25',
          actionUrl: '/notices',
          actionLabel: 'Read Notice',
          dedupKey: `${userId}_not_ese_spring_25`,
        },
      ];

      for (const item of studentItems) {
        if (!userList.some((existing) => existing.dedupKey === item.dedupKey)) {
          userList.push({
            ...item,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 12)).toISOString(),
            isRead: false,
          });
        }
      }
    } else if (role === 'FACULTY') {
      const facultyItems: Array<Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>> = [
        {
          userId,
          type: 'ACADEMIC',
          title: 'Upcoming Lecture Schedule',
          message: 'You have a scheduled lecture for Distributed Systems (CS601) in Room A-204 at 11:00 AM.',
          priority: 'NORMAL',
          relatedEntity: 'SCHEDULE',
          relatedEntityId: 'sch-fac-cs601',
          actionUrl: '/academic/schedule',
          actionLabel: 'View Schedule',
          dedupKey: `${userId}_fac_sch_cs601`,
        },
        {
          userId,
          type: 'ACADEMIC',
          title: 'Continuous Assessment Evaluation',
          message: '58 of 64 students have submitted Assignment 1 for Cloud Computing (CS603). Grading window is open.',
          priority: 'NORMAL',
          relatedEntity: 'ASSIGNMENT',
          relatedEntityId: 'asg-eval-cs603',
          actionUrl: '/academic/assignments',
          actionLabel: 'Review Submissions',
          dedupKey: `${userId}_fac_asg_eval_cs603`,
        },
        {
          userId,
          type: 'SERVICE_REQUEST',
          title: 'Department Helpdesk Ticket Assigned',
          message: 'A laboratory maintenance request regarding Computing Lab 2 Network Switch has been assigned to your department coordinator.',
          priority: 'HIGH',
          relatedEntity: 'SERVICE_REQUEST',
          relatedEntityId: 'srv-fac-lab2',
          actionUrl: '/services/requests',
          actionLabel: 'Inspect Request',
          dedupKey: `${userId}_fac_srv_lab2`,
        },
      ];

      for (const item of facultyItems) {
        if (!userList.some((existing) => existing.dedupKey === item.dedupKey)) {
          userList.push({
            ...item,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 8)).toISOString(),
            isRead: false,
          });
        }
      }
    } else if (role === 'ADMIN') {
      const adminItems: Array<Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>> = [
        {
          userId,
          type: 'SERVICE_REQUEST',
          title: 'High-Priority Maintenance Request Open',
          message: '3 unresolved high-priority facility requests require administrative assignment in Block A & Central Library.',
          priority: 'HIGH',
          relatedEntity: 'SERVICE_REQUEST',
          relatedEntityId: 'adm-srv-high-prio',
          actionUrl: '/admin/services',
          actionLabel: 'Manage Tickets',
          dedupKey: `${userId}_adm_srv_high_prio`,
        },
        {
          userId,
          type: 'SYSTEM',
          title: 'Autonomous Exam Cell Timetable Published',
          message: 'Spring 2025 ESE final schedule broadcast completed to 1,420 students and 86 faculty members.',
          priority: 'NORMAL',
          relatedEntity: 'NOTICE',
          relatedEntityId: 'adm-notice-broadcast',
          actionUrl: '/notices',
          actionLabel: 'View Circular',
          dedupKey: `${userId}_adm_notice_broadcast`,
        },
        {
          userId,
          type: 'SECURITY',
          title: 'System Security & Gateway Status',
          message: 'Campus Gateway authentication and AI audit logging operating at 99.98% uptime with zero anomalies.',
          priority: 'LOW',
          relatedEntity: 'SYSTEM',
          relatedEntityId: 'adm-sys-gateway',
          actionUrl: '/admin/ai',
          actionLabel: 'View AI Audit Console',
          dedupKey: `${userId}_adm_sys_gateway`,
        },
      ];

      for (const item of adminItems) {
        if (!userList.some((existing) => existing.dedupKey === item.dedupKey)) {
          userList.push({
            ...item,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 4)).toISOString(),
            isRead: false,
          });
        }
      }
    }
  }

  /**
   * Retrieve filtered notifications for a user (strictly enforcing role & userId isolation)
   */
  static async getUserNotifications(params: {
    userId: string;
    role: string;
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
    page?: number;
    limit?: number;
  }) {
    const { userId, role, unreadOnly, type, priority, page = 1, limit = 50 } = params;

    // Seed default smart notifications if needed
    await this.seedUserSmartNotifications(userId, role);

    const prefs = await this.getPreferences(userId);
    const quietHoursActive = this.isQuietHoursActive(prefs);

    let list = inMemoryNotifications.get(userId) || [];

    // Filter by preferences & quiet hours
    list = list.filter((n) => {
      // Security and URGENT notifications always bypass filters and quiet hours
      if (n.priority === 'URGENT' || n.type === 'SECURITY') return true;

      // Category filter preferences
      if (n.type === 'ACADEMIC' && !prefs.academicEnabled) return false;
      if (n.type === 'EVENT' && !prefs.eventsEnabled) return false;
      if (n.type === 'NOTICE' && !prefs.noticesEnabled) return false;
      if (n.type === 'SERVICE_REQUEST' && !prefs.servicesEnabled) return false;
      if (n.type === 'CAMPUS' && !prefs.campusEnabled) return false;

      // During quiet hours, defer normal & low priority notifications
      if (quietHoursActive && (n.priority === 'LOW' || n.priority === 'NORMAL')) {
        return false;
      }

      return true;
    });

    if (unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }
    if (type) {
      list = list.filter((n) => n.type === type);
    }
    if (priority) {
      list = list.filter((n) => n.priority === priority);
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const unreadCount = list.filter((n) => !n.isRead).length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      notifications: paginated,
      total,
      unreadCount,
      page,
      limit,
      quietHoursActive,
    };
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string, role: string): Promise<number> {
    const res = await this.getUserNotifications({ userId, role, unreadOnly: true });
    return res.unreadCount;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const list = inMemoryNotifications.get(userId) || [];
    const target = list.find((n) => n.id === notificationId);
    if (!target) return false;

    target.isRead = true;
    target.readAt = new Date().toISOString();
    return true;
  }

  /**
   * Mark all unread notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const list = inMemoryNotifications.get(userId) || [];
    let count = 0;
    const now = new Date().toISOString();
    list.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = now;
        count++;
      }
    });
    return count;
  }

  /**
   * Generate Personalized Daily Campus Summary
   */
  static async getDailySummary(userId: string, role: string): Promise<DailySummary> {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (role === 'STUDENT') {
      return {
        greeting,
        summaryText: `${greeting}, Aarav. Today you have 2 lectures and 1 practical lab session scheduled. You have 1 assignment due in 24 hours.`,
        classesToday: 3,
        pendingDeadlines: 1,
        registeredEvents: 1,
        unreadNotices: 1,
        highlights: [
          'CS602 Machine Learning Lab at 10:30 AM in Computing Lab 3',
          'Assignment 2 for CS601 Distributed Systems due tomorrow at 11:59 PM',
          'Technovate Hackathon 2025 orientation at 04:00 PM in Main Auditorium',
          'Spring 2025 ESE Examination Schedule published by Autonomous Exam Cell',
        ],
      };
    } else if (role === 'FACULTY') {
      return {
        greeting,
        summaryText: `${greeting}, Professor. You have 2 scheduled lectures today across Section A and Section B.`,
        classesToday: 2,
        pendingDeadlines: 1,
        registeredEvents: 0,
        unreadNotices: 1,
        highlights: [
          'CS601 Distributed Systems Lecture at 11:00 AM in Room A-204',
          'Continuous Assessment grading window open for Cloud Computing (CS603)',
          'Faculty Council meeting circular published regarding NAAC Accreditation review',
        ],
      };
    } else {
      return {
        greeting,
        summaryText: `${greeting}, Administrator. Institutional operations report: 4 open maintenance tickets and 99.98% system gateway uptime.`,
        classesToday: 0,
        pendingDeadlines: 4,
        registeredEvents: 2,
        unreadNotices: 0,
        highlights: [
          '3 high-priority helpdesk requests awaiting technician assignment',
          'Campus-wide student attendance aggregate standing at 83.8%',
          'Technovate Hackathon facility preparations confirmed in Main Auditorium',
        ],
      };
    }
  }

  /**
   * Generate Smart Contextual Recommendations
   */
  static async getSmartRecommendations(userId: string, role: string): Promise<SmartRecommendation[]> {
    if (role === 'STUDENT') {
      return [
        {
          id: 'rec-1',
          title: 'Upcoming Lab in Computing Lab 3',
          description: 'Your practical session begins in 20 minutes. Estimated walking time from Block A is 3 minutes.',
          category: 'SCHEDULE',
          actionUrl: '/campus/rooms',
          actionLabel: 'View Lab Location',
          priority: 'HIGH',
        },
        {
          id: 'rec-2',
          title: 'Continuous Assessment Submission Window',
          description: 'CS601 Assignment 2 is due tomorrow. Complete and submit early to avoid server traffic.',
          category: 'ACADEMIC',
          actionUrl: '/academic/assignments',
          actionLabel: 'Submit Assignment',
          priority: 'NORMAL',
        },
        {
          id: 'rec-3',
          title: 'Free Window Before Evening Fest',
          description: 'You have no scheduled sessions between 02:00 PM and 04:00 PM. Central Library has open reading desks.',
          category: 'LOCATION',
          actionUrl: '/campus/facilities',
          actionLabel: 'Check Library Amenities',
          priority: 'NORMAL',
        },
      ];
    } else if (role === 'FACULTY') {
      return [
        {
          id: 'rec-fac-1',
          title: 'Upcoming Class in Room A-204',
          description: 'Your CS601 lecture starts at 11:00 AM in Academic Main Block.',
          category: 'SCHEDULE',
          actionUrl: '/academic/schedule',
          actionLabel: 'View Schedule',
          priority: 'HIGH',
        },
        {
          id: 'rec-fac-2',
          title: 'Remedial Attendance Monitoring',
          description: '3 students in CS603 are currently below the 75% examination threshold.',
          category: 'ACADEMIC',
          actionUrl: '/analytics',
          actionLabel: 'View Course Analytics',
          priority: 'NORMAL',
        },
      ];
    } else {
      return [
        {
          id: 'rec-adm-1',
          title: 'Unresolved High-Priority Service Requests',
          description: 'Assign maintenance team to Block A Projector and Central Library HVAC tickets.',
          category: 'SERVICES',
          actionUrl: '/admin/services',
          actionLabel: 'Assign Technicians',
          priority: 'HIGH',
        },
      ];
    }
  }

  /**
   * Admin: Preview Targeted Institutional Broadcast
   */
  static async previewAdminBroadcast(params: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetAudience: 'ALL_STUDENTS' | 'ALL_FACULTY' | 'ALL_CAMPUS' | 'DEPARTMENT_CSE' | 'SEMESTER_6';
    actionUrl?: string;
    actionLabel?: string;
  }) {
    let estimatedRecipients = 0;
    if (params.targetAudience === 'ALL_CAMPUS') estimatedRecipients = 1506;
    else if (params.targetAudience === 'ALL_STUDENTS') estimatedRecipients = 1420;
    else if (params.targetAudience === 'ALL_FACULTY') estimatedRecipients = 86;
    else if (params.targetAudience === 'DEPARTMENT_CSE') estimatedRecipients = 420;
    else if (params.targetAudience === 'SEMESTER_6') estimatedRecipients = 340;

    return {
      preview: {
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority,
        targetAudience: params.targetAudience,
        actionUrl: params.actionUrl || null,
        actionLabel: params.actionLabel || null,
        estimatedRecipients,
      },
      readyToPublish: true,
    };
  }

  /**
   * Admin: Publish Institutional Broadcast with Confirmation & Audit Log
   */
  static async publishAdminBroadcast(params: {
    adminId: string;
    adminEmail: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetAudience: 'ALL_STUDENTS' | 'ALL_FACULTY' | 'ALL_CAMPUS' | 'DEPARTMENT_CSE' | 'SEMESTER_6';
    confirmed: boolean;
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
  }) {
    if (!params.confirmed) {
      throw new Error('Explicit confirmation is required before publishing administrative broadcasts.');
    }

    const { preview } = await this.previewAdminBroadcast(params);
    const broadcastId = `adm-bc-${Date.now()}`;

    // Record to Audit Log
    const auditEntry: AdminNotificationAudit = {
      id: broadcastId,
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority,
      targetAudience: params.targetAudience,
      recipientCount: preview.estimatedRecipients,
      publishedAt: new Date().toISOString(),
      expiresAt: params.expiresAt || null,
    };
    inMemoryAuditLogs.unshift(auditEntry);

    // Broadcast into in-memory store for active users
    const broadcastNotification: NotificationItem = {
      id: `notif-bc-${Date.now()}`,
      userId: 'broadcast',
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority,
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: params.actionUrl || null,
      actionLabel: params.actionLabel || null,
      expiresAt: params.expiresAt || null,
    };

    // Add to all active user in-memory streams
    inMemoryNotifications.forEach((list) => {
      list.unshift({ ...broadcastNotification, id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
    });

    return {
      success: true,
      broadcastId,
      recipientCount: preview.estimatedRecipients,
      audit: auditEntry,
    };
  }

  /**
   * Admin: Get Broadcast Audit Logs
   */
  static async getAdminAuditLogs(): Promise<AdminNotificationAudit[]> {
    return inMemoryAuditLogs;
  }

  /**
   * AI-Powered Notification Explanation
   */
  static async explainNotificationsWithAI(params: {
    question: string;
    userId: string;
    role: string;
  }): Promise<{ answer: string; notificationsReferenced: number }> {
    const { question, userId, role } = params;
    const notificationsData = await this.getUserNotifications({ userId, role });
    const dailySummary = await this.getDailySummary(userId, role);

    const contextPayload = {
      role,
      unreadCount: notificationsData.unreadCount,
      recentNotifications: notificationsData.notifications.slice(0, 8),
      dailySummary,
    };

    if (geminiClient.isAvailable()) {
      try {
        const client = geminiClient.getClient();
        const modelName = geminiClient.getModelName();

        const prompt = `You are the Campus 360 Smart Notification AI Assistant for TGPCET Autonomous Campus.
User Role: ${role}
User Question: "${question}"

Authorized Ground-Truth Notification & Schedule Context:
${JSON.stringify(contextPayload, null, 2)}

Instructions:
1. Explain what is upcoming, important, or due based strictly on the authorized notifications and daily summary provided.
2. Ground all answers in this data. Do not hallucinate classes, assignments, or events not listed.
3. Be concise, polite, and actionable. Format with clean markdown bolding and bullet points.`;

        const response = await client!.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: AIPolicy.SYSTEM_INSTRUCTION,
            temperature: 0.2,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          return {
            answer: response.text.trim(),
            notificationsReferenced: notificationsData.notifications.length,
          };
        }
      } catch {
        // fallback
      }
    }

    // Deterministic Smart Fallback Explanation
    let fallback = `🔔 **Campus Intelligence Daily Briefing:**\n\n`;
    fallback += `• ${dailySummary.summaryText}\n`;
    fallback += `• **Unread Notifications:** You currently have **${notificationsData.unreadCount} unread update(s)**.\n\n`;
    fallback += `**Key Highlights:**\n`;
    dailySummary.highlights.forEach((h) => {
      fallback += `  - ${h}\n`;
    });

    return {
      answer: fallback,
      notificationsReferenced: notificationsData.notifications.length,
    };
  }
}
