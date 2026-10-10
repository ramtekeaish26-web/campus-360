import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NotificationService } from './notificationService.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'], // requester or admin can close or reopen for rework
  CLOSED: [], // terminal state
  REJECTED: ['OPEN'], // admin may reopen
};

export class HelpdeskService {
  static async getServiceCategories() {
    if (!isDbConnected()) return [];
    return await prisma.serviceCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async getServiceDirectory() {
    if (!isDbConnected()) return [];
    // Services directory derived from Campus Places tagged as facilities/administration/services
    const places = await prisma.campusPlace.findMany({
      where: {
        status: 'ACTIVE',
        category: {
          code: { in: ['ADMINISTRATION', 'FACILITY', 'FOOD', 'ACADEMIC', 'LIBRARY', 'SPORTS'] },
        },
      },
      include: {
        category: true,
        building: true,
        facilities: { include: { facility: true } },
      },
      orderBy: { name: 'asc' },
    });

    return places.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category.name,
      categoryCode: p.category.code,
      building: p.building ? { id: p.building.id, name: p.building.name } : null,
      phone: p.phone,
      email: p.email,
      website: p.website,
      latitude: p.latitude,
      longitude: p.longitude,
      facilities: p.facilities.map((f) => f.facility.name),
    }));
  }

  static async getServiceRequests(params: {
    userId?: string;
    role?: string;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (!isDbConnected()) return { requests: [], total: 0, page: 1, totalPages: 0 };
    const { userId, role, status, category, priority, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can ONLY view their own service requests
    if (role !== 'ADMIN') {
      where.requesterId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          requester: {
            include: { profile: true },
          },
          assignedUser: {
            include: { profile: true },
          },
          assignedDepartment: true,
          building: true,
          place: true,
          room: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return {
      requests: requests.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        priority: r.priority,
        status: r.status,
        locationDetails: r.locationDetails,
        building: r.building ? { id: r.building.id, name: r.building.name } : null,
        room: r.room ? { id: r.room.id, roomNumber: r.room.roomNumber, name: r.room.name } : null,
        place: r.place ? { id: r.place.id, name: r.place.name, slug: r.place.slug } : null,
        requester: {
          id: r.requester.id,
          name: r.requester.profile ? `${r.requester.profile.firstName} ${r.requester.profile.lastName}` : r.requester.email,
          email: r.requester.email,
        },
        assignedTo: r.assignedUser
          ? {
              id: r.assignedUser.id,
              name: r.assignedUser.profile
                ? `${r.assignedUser.profile.firstName} ${r.assignedUser.profile.lastName}`
                : r.assignedUser.email,
            }
          : null,
        commentCount: r._count.comments,
        resolvedAt: r.resolvedAt,
        closedAt: r.closedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getServiceRequestById(id: string, userId: string, role: string) {
    if (!isDbConnected()) return null;
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        requester: {
          include: { profile: true },
        },
        assignedUser: {
          include: { profile: true },
        },
        assignedDepartment: true,
        building: true,
        room: true,
        place: true,
        comments: {
          include: {
            author: { include: { profile: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        history: {
          include: {
            user: { include: { profile: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) return null;

    // Strict data isolation: students & faculty cannot access other users' requests
    if (role !== 'ADMIN' && request.requesterId !== userId) {
      throw new AppError('Forbidden: You can only view your own service requests', 403);
    }

    return {
      ...request,
      requester: {
        id: request.requester.id,
        name: request.requester.profile
          ? `${request.requester.profile.firstName} ${request.requester.profile.lastName}`
          : request.requester.email,
        email: request.requester.email,
      },
      assignedUser: request.assignedUser
        ? {
            id: request.assignedUser.id,
            name: request.assignedUser.profile
              ? `${request.assignedUser.profile.firstName} ${request.assignedUser.profile.lastName}`
              : request.assignedUser.email,
          }
        : null,
      comments: request.comments
        .filter((c) => role === 'ADMIN' || !c.isInternal)
        .map((c) => ({
          id: c.id,
          content: c.content,
          isInternal: c.isInternal,
          createdAt: c.createdAt,
          author: {
            id: c.author.id,
            name: c.author.profile ? `${c.author.profile.firstName} ${c.author.profile.lastName}` : c.author.email,
          },
        })),
      history: request.history.map((h) => ({
        id: h.id,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        comment: h.comment,
        createdAt: h.createdAt,
        changedBy: {
          id: h.user.id,
          name: h.user.profile ? `${h.user.profile.firstName} ${h.user.profile.lastName}` : h.user.email,
        },
      })),
    };
  }

  static async createServiceRequest(data: any, requesterId: string) {
    if (!isDbConnected()) return null;
    const request = await prisma.serviceRequest.create({
      data: {
        ...data,
        requesterId,
        status: 'OPEN',
      },
    });

    // Create initial audit record
    await prisma.serviceRequestHistory.create({
      data: {
        requestId: request.id,
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: requesterId,
        comment: 'Service request created by student/user.',
      },
    });

    return request;
  }

  static async updateServiceRequestStatus(
    id: string,
    params: {
      status: string;
      assignedTo?: string | null;
      assignedDepartmentId?: string | null;
      comment?: string;
    },
    changedById: string,
    role: string
  ) {
    if (!isDbConnected()) return null;
    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Service request not found', 404);

    // Only Admin can make general status updates
    if (role !== 'ADMIN') {
      throw new AppError('Forbidden: Only admins can manage service request status', 403);
    }

    const currentStatus = request.status;
    const newStatus = params.status;

    if (currentStatus !== newStatus) {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
      }
    }

    const updateData: any = {
      status: newStatus,
      assignedTo: params.assignedTo !== undefined ? params.assignedTo : request.assignedTo,
      assignedDepartmentId:
        params.assignedDepartmentId !== undefined ? params.assignedDepartmentId : request.assignedDepartmentId,
      resolvedAt: newStatus === 'RESOLVED' ? new Date() : request.resolvedAt,
      closedAt: newStatus === 'CLOSED' ? new Date() : request.closedAt,
    };

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
    });

    // Add audit history
    await prisma.serviceRequestHistory.create({
      data: {
        requestId: id,
        oldStatus: currentStatus,
        newStatus,
        changedBy: changedById,
        comment: params.comment || `Status updated from ${currentStatus} to ${newStatus}`,
      },
    });

    // Trigger in-app notification to requester
    await NotificationService.createNotification({
      userId: request.requesterId,
      type: 'SERVICE_REQUEST',
      title: `Service Request Status: ${newStatus}`,
      message: `Your request "${request.title}" is now ${newStatus.replace('_', ' ')}.`,
      referenceType: 'SERVICE_REQUEST',
      referenceId: request.id,
    });

    return updated;
  }

  static async addComment(
    requestId: string,
    authorId: string,
    role: string,
    content: string,
    isInternal = false
  ) {
    if (!isDbConnected()) return null;
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new AppError('Service request not found', 404);

    // Non-admins can only comment on their own requests and cannot create internal notes
    if (role !== 'ADMIN') {
      if (request.requesterId !== authorId) {
        throw new AppError('Forbidden: You can only comment on your own service requests', 403);
      }
      isInternal = false;
    }

    const comment = await prisma.serviceRequestComment.create({
      data: {
        requestId,
        authorId,
        content,
        isInternal,
      },
      include: {
        author: { include: { profile: true } },
      },
    });

    // If admin commented, notify requester
    if (role === 'ADMIN' && !isInternal && request.requesterId !== authorId) {
      await NotificationService.createNotification({
        userId: request.requesterId,
        type: 'SERVICE_REQUEST',
        title: 'New Update on Your Service Request',
        message: `Admin added a response to "${request.title}".`,
        referenceType: 'SERVICE_REQUEST',
        referenceId: request.id,
      });
    }

    return {
      id: comment.id,
      content: comment.content,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        name: comment.author.profile
          ? `${comment.author.profile.firstName} ${comment.author.profile.lastName}`
          : comment.author.email,
      },
    };
  }

  static async closeServiceRequest(id: string, userId: string, role: string) {
    if (!isDbConnected()) return null;
    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Service request not found', 404);

    if (role !== 'ADMIN' && request.requesterId !== userId) {
      throw new AppError('Forbidden: You cannot close another user’s request', 403);
    }

    if (request.status === 'CLOSED') {
      return request;
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    await prisma.serviceRequestHistory.create({
      data: {
        requestId: id,
        oldStatus: request.status,
        newStatus: 'CLOSED',
        changedBy: userId,
        comment: 'Request closed by user.',
      },
    });

    return updated;
  }
}
