import { Request, Response, NextFunction } from 'express';
import { NoticesService } from '../services/noticesService.js';
import { EventsService } from '../services/eventsService.js';
import { ClubsService } from '../services/clubsService.js';
import { HelpdeskService } from '../services/helpdeskService.js';
import { LostFoundService } from '../services/lostFoundService.js';
import { EmergencyService } from '../services/emergencyService.js';
import { FeedbackService } from '../services/feedbackService.js';
import { NotificationService } from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

function getUserRole(req: Request): string {
  const user = (req as any).user;
  if (!user || !user.roles) return 'STUDENT';
  if (Array.isArray(user.roles)) {
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('FACULTY')) return 'FACULTY';
    const first = user.roles[0];
    return typeof first === 'string' ? first : (first as any)?.code || 'STUDENT';
  }
  return 'STUDENT';
}

export class ServicesController {
  // ================= NOTICES =================
  static async getNotices(req: Request, res: Response, next: NextFunction) {
    try {
      const role = getUserRole(req);
      const userId = (req as any).user?.id;
      const { category, priority, search, page, limit } = req.query;

      const result = await NoticesService.getNotices({
        role,
        userId,
        category: category as string,
        priority: priority as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getNoticeById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const notice = await NoticesService.getNoticeById(req.params.id, userId);
      if (!notice) throw new AppError('Notice not found', 404);
      return sendSuccess(res, { notice });
    } catch (err) {
      next(err);
    }
  }

  static async markNoticeAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await NoticesService.markNoticeAsRead(req.params.id, userId);
      return sendSuccess(res, { message: 'Notice marked as read' });
    } catch (err) {
      next(err);
    }
  }

  // ================= EVENTS =================
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { category, status, upcoming, search, page, limit } = req.query;

      const result = await EventsService.getEvents({
        userId,
        category: category as string,
        status: status as string,
        upcomingOnly: upcoming === 'true',
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const event = await EventsService.getEventById(req.params.id, userId);
      if (!event) throw new AppError('Event not found', 404);
      return sendSuccess(res, { event });
    } catch (err) {
      next(err);
    }
  }

  static async registerForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const registration = await EventsService.registerForEvent(req.params.id, userId);
      return sendSuccess(res, { registration }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async cancelEventRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await EventsService.cancelRegistration(req.params.id, userId);
      return sendSuccess(res, { message: 'Event registration cancelled successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ================= CLUBS =================
  static async getClubs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { category, search } = req.query;
      const clubs = await ClubsService.getClubs({
        category: category as string,
        search: search as string,
        userId,
      });
      return sendSuccess(res, { clubs });
    } catch (err) {
      next(err);
    }
  }

  static async getClubBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const club = await ClubsService.getClubBySlug(req.params.slug, userId);
      if (!club) throw new AppError('Club not found', 404);
      return sendSuccess(res, { club });
    } catch (err) {
      next(err);
    }
  }

  static async joinClub(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const membership = await ClubsService.joinClub(req.params.id, userId);
      return sendSuccess(res, { membership }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async leaveClub(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await ClubsService.leaveClub(req.params.id, userId);
      return sendSuccess(res, { message: 'Left club successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ================= HELPDESK & SERVICE REQUESTS =================
  static async getServiceCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await HelpdeskService.getServiceCategories();
      return sendSuccess(res, { categories });
    } catch (err) {
      next(err);
    }
  }

  static async getServiceDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const directory = await HelpdeskService.getServiceDirectory();
      return sendSuccess(res, { directory });
    } catch (err) {
      next(err);
    }
  }

  static async getServiceRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const { status, category, priority, search, page, limit } = req.query;

      const result = await HelpdeskService.getServiceRequests({
        userId: user.id,
        role,
        status: status as string,
        category: category as string,
        priority: priority as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });

      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getServiceRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const request = await HelpdeskService.getServiceRequestById(req.params.id, user.id, role);
      if (!request) throw new AppError('Service request not found', 404);
      return sendSuccess(res, { request });
    } catch (err) {
      next(err);
    }
  }

  static async createServiceRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const request = await HelpdeskService.createServiceRequest(req.body, userId);
      return sendSuccess(res, { request }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateServiceRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const updated = await HelpdeskService.updateServiceRequestStatus(
        req.params.id,
        req.body,
        user.id,
        role
      );
      return sendSuccess(res, { request: updated });
    } catch (err) {
      next(err);
    }
  }

  static async addServiceRequestComment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const comment = await HelpdeskService.addComment(
        req.params.id,
        user.id,
        role,
        req.body.content,
        req.body.isInternal
      );
      return sendSuccess(res, { comment }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async closeServiceRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const updated = await HelpdeskService.closeServiceRequest(req.params.id, user.id, role);
      return sendSuccess(res, { request: updated });
    } catch (err) {
      next(err);
    }
  }

  // ================= LOST & FOUND =================
  static async getLostFoundItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, category, status, search, page, limit } = req.query;
      const result = await LostFoundService.getItems({
        type: type as string,
        category: category as string,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getLostFoundItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const role = getUserRole(req);
      const item = await LostFoundService.getItemById(req.params.id, user.id, role);
      if (!item) throw new AppError('Item not found', 404);
      return sendSuccess(res, { item });
    } catch (err) {
      next(err);
    }
  }

  static async reportLostFoundItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const item = await LostFoundService.reportItem(req.body, userId);
      return sendSuccess(res, { item }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async submitLostFoundClaim(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const claim = await LostFoundService.submitClaim(
        req.params.id,
        userId,
        req.body.description,
        req.body.contactInfo
      );
      return sendSuccess(res, { claim }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async moderateLostFoundClaim(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const claim = await LostFoundService.moderateClaim(
        req.params.claimId,
        req.body.status,
        userId
      );
      return sendSuccess(res, { claim });
    } catch (err) {
      next(err);
    }
  }

  // ================= EMERGENCY & SAFETY =================
  static async getEmergencyContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await EmergencyService.getEmergencyContacts();
      return sendSuccess(res, { contacts });
    } catch (err) {
      next(err);
    }
  }

  // ================= FEEDBACK =================
  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const feedback = await FeedbackService.submitFeedback(req.body, userId);
      return sendSuccess(res, { feedback }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId, page, limit } = req.query;
      const result = await FeedbackService.getFeedback({
        targetType: targetType as string,
        targetId: targetId as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  // ================= NOTIFICATIONS =================
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const role = getUserRole(req);
      const { page, limit } = req.query;
      const result = await NotificationService.getUserNotifications({
        userId,
        role,
        limit: limit ? parseInt(limit as string) : 50,
        page: page ? parseInt(page as string) : 1,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getUnreadNotificationCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const role = getUserRole(req);
      const count = await NotificationService.getUnreadCount(userId, role);
      return sendSuccess(res, { unreadCount: count });
    } catch (err) {
      next(err);
    }
  }

  static async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await NotificationService.markAsRead(req.params.id, userId);
      return sendSuccess(res, { message: 'Notification marked as read' });
    } catch (err) {
      next(err);
    }
  }

  static async markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await NotificationService.markAllAsRead(userId);
      return sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMIN MUTATIONS =================
  static async adminCreateNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const notice = await NoticesService.createNotice(req.body, userId);
      return sendSuccess(res, { notice }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async adminUpdateNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const notice = await NoticesService.updateNotice(req.params.id, req.body);
      return sendSuccess(res, { notice });
    } catch (err) {
      next(err);
    }
  }

  static async adminDeleteNotice(req: Request, res: Response, next: NextFunction) {
    try {
      await NoticesService.deleteNotice(req.params.id);
      return sendSuccess(res, { message: 'Notice deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async adminCreateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const event = await EventsService.createEvent(req.body, userId);
      return sendSuccess(res, { event }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async adminUpdateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventsService.updateEvent(req.params.id, req.body);
      return sendSuccess(res, { event });
    } catch (err) {
      next(err);
    }
  }

  static async adminDeleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      await EventsService.deleteEvent(req.params.id);
      return sendSuccess(res, { message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async adminCreateClub(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const club = await ClubsService.createClub(req.body, userId);
      return sendSuccess(res, { club }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async adminUpdateClub(req: Request, res: Response, next: NextFunction) {
    try {
      const club = await ClubsService.updateClub(req.params.id, req.body);
      return sendSuccess(res, { club });
    } catch (err) {
      next(err);
    }
  }

  static async adminCreateEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await EmergencyService.createEmergencyContact(req.body);
      return sendSuccess(res, { contact }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async adminUpdateEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await EmergencyService.updateEmergencyContact(req.params.id, req.body);
      return sendSuccess(res, { contact });
    } catch (err) {
      next(err);
    }
  }

  static async adminDeleteEmergencyContact(req: Request, res: Response, next: NextFunction) {
    try {
      await EmergencyService.deleteEmergencyContact(req.params.id);
      return sendSuccess(res, { message: 'Emergency contact deleted' });
    } catch (err) {
      next(err);
    }
  }
}
