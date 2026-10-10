import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NotificationService } from './notificationService.js';

export class EventsService {
  static async getEvents(params: {
    userId?: string;
    category?: string;
    status?: string;
    upcomingOnly?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (!isDbConnected()) return { events: [], total: 0, page: 1, totalPages: 0 };
    const { userId, category, status = 'PUBLISHED', upcomingOnly = false, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status,
    };

    if (category) {
      where.category = category;
    }

    if (upcomingOnly) {
      where.startDateTime = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rawEvents, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          location: {
            select: { id: true, name: true, slug: true, latitude: true, longitude: true },
          },
          organizer: {
            include: { profile: true },
          },
          registrations: {
            select: { id: true, userId: true, status: true },
          },
        },
        orderBy: { startDateTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const events = rawEvents.map((e) => {
      const activeRegistrations = e.registrations.filter((r) => r.status === 'REGISTERED');
      const userReg = userId ? e.registrations.find((r) => r.userId === userId && r.status === 'REGISTERED') : null;

      return {
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        startDateTime: e.startDateTime,
        endDateTime: e.endDateTime,
        venue: e.venue,
        location: e.location,
        capacity: e.capacity,
        registrationRequired: e.registrationRequired,
        status: e.status,
        image: e.image,
        registeredCount: activeRegistrations.length,
        isRegistered: !!userReg,
        registrationId: userReg?.id || null,
        organizer: {
          id: e.organizer.id,
          name: e.organizer.profile ? `${e.organizer.profile.firstName} ${e.organizer.profile.lastName}` : e.organizer.email,
        },
      };
    });

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getEventById(id: string, userId?: string) {
    if (!isDbConnected()) return null;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true, slug: true, latitude: true, longitude: true, building: true },
        },
        organizer: {
          include: { profile: true },
        },
        registrations: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!event) return null;

    const activeRegistrations = event.registrations.filter((r) => r.status === 'REGISTERED');
    const userReg = userId ? event.registrations.find((r) => r.userId === userId && r.status === 'REGISTERED') : null;

    return {
      ...event,
      registeredCount: activeRegistrations.length,
      isRegistered: !!userReg,
      registrationId: userReg?.id || null,
      organizer: {
        id: event.organizer.id,
        name: event.organizer.profile ? `${event.organizer.profile.firstName} ${event.organizer.profile.lastName}` : event.organizer.email,
        email: event.organizer.email,
      },
    };
  }

  static async registerForEvent(eventId: string, userId: string) {
    if (!isDbConnected()) return null;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: { status: 'REGISTERED' },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'PUBLISHED') {
      throw new AppError('Event is not open for registration', 400);
    }

    if (event.capacity && event.registrations.length >= event.capacity) {
      throw new AppError('Event has reached maximum registration capacity', 400);
    }

    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: {
        status: 'REGISTERED',
        registeredAt: new Date(),
      },
      create: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
    });

    // Send in-app notification
    await NotificationService.createNotification({
      userId,
      type: 'EVENT',
      title: 'Event Registration Confirmed',
      message: `You are registered for "${event.title}" scheduled on ${new Date(event.startDateTime).toLocaleDateString()}.`,
      referenceType: 'EVENT',
      referenceId: event.id,
    });

    return registration;
  }

  static async cancelRegistration(eventId: string, userId: string) {
    if (!isDbConnected()) return null;
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!registration) {
      throw new AppError('No registration found for this event', 404);
    }

    return await prisma.eventRegistration.update({
      where: {
        eventId_userId: { eventId, userId },
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  static async createEvent(data: any, organizerId: string) {
    if (!isDbConnected()) return null;
    return await prisma.event.create({
      data: {
        ...data,
        organizerId,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
      },
    });
  }

  static async updateEvent(id: string, data: any) {
    if (!isDbConnected()) return null;
    return await prisma.event.update({
      where: { id },
      data: {
        ...data,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : undefined,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : undefined,
      },
    });
  }

  static async deleteEvent(id: string) {
    if (!isDbConnected()) return null;
    return await prisma.event.delete({
      where: { id },
    });
  }
}
