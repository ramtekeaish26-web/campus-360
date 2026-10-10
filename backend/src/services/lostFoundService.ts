import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { NotificationService } from './notificationService.js';

export class LostFoundService {
  static async getItems(params: {
    type?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (!isDbConnected()) return { items: [], total: 0, page: 1, totalPages: 0 };
    const { type, category, status, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      isModerated: true,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { locationText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.lostFoundItem.findMany({
        where,
        include: {
          location: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { claims: true },
          },
        },
        orderBy: { itemDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lostFoundItem.count({ where }),
    ]);

    // Explicitly sanitize items: No PII (phone/email/student ID) returned to general users
    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        locationText: item.locationText,
        itemDate: item.itemDate,
        image: item.image,
        status: item.status,
        claimCount: item._count.claims,
        createdAt: item.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getItemById(id: string, userId: string, role: string) {
    if (!isDbConnected()) return null;
    const item = await prisma.lostFoundItem.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true, slug: true, latitude: true, longitude: true },
        },
        reportedBy: {
          include: { profile: true },
        },
        claims: {
          include: {
            claimant: { include: { profile: true } },
          },
        },
      },
    });

    if (!item) return null;

    const isOwner = item.reportedById === userId;
    const isAdmin = role === 'ADMIN';

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      locationText: item.locationText,
      itemDate: item.itemDate,
      image: item.image,
      status: item.status,
      // Only include reporter info if admin or the owner
      reportedBy:
        isOwner || isAdmin
          ? {
              id: item.reportedBy.id,
              name: item.reportedBy.profile
                ? `${item.reportedBy.profile.firstName} ${item.reportedBy.profile.lastName}`
                : item.reportedBy.email,
              email: item.reportedBy.email,
            }
          : { name: 'Campus Community Member' },
      // Only include claims if admin or item reporter
      claims:
        isAdmin || isOwner
          ? item.claims.map((c) => ({
              id: c.id,
              description: c.description,
              contactInfo: isAdmin ? c.contactInfo : '[Confidential to Admin]',
              status: c.status,
              createdAt: c.createdAt,
              claimant: {
                id: c.claimant.id,
                name: c.claimant.profile
                  ? `${c.claimant.profile.firstName} ${c.claimant.profile.lastName}`
                  : c.claimant.email,
              },
            }))
          : [],
      createdAt: item.createdAt,
    };
  }

  static async reportItem(data: any, reportedById: string) {
    if (!isDbConnected()) return null;
    return await prisma.lostFoundItem.create({
      data: {
        ...data,
        reportedById,
        itemDate: data.itemDate ? new Date(data.itemDate) : new Date(),
        status: 'OPEN',
        isModerated: true,
      },
    });
  }

  static async submitClaim(itemId: string, claimantId: string, description: string, contactInfo: string) {
    if (!isDbConnected()) return null;
    const item = await prisma.lostFoundItem.findUnique({ where: { id: itemId } });
    if (!item) throw new AppError('Item not found', 404);

    if (item.reportedById === claimantId) {
      throw new AppError('You cannot submit a claim on an item you reported', 400);
    }

    const claim = await prisma.lostFoundClaim.create({
      data: {
        itemId,
        claimantId,
        description,
        contactInfo,
        status: 'PENDING',
      },
    });

    // Notify item reporter that a claim was made
    await NotificationService.createNotification({
      userId: item.reportedById,
      type: 'LOST_FOUND',
      title: 'Claim Submitted for Your Reported Item',
      message: `A claim was submitted for "${item.title}". Admin will moderate this claim.`,
      referenceType: 'LOST_FOUND',
      referenceId: item.id,
    });

    return claim;
  }

  static async moderateClaim(claimId: string, status: 'APPROVED' | 'REJECTED', moderatorId: string) {
    if (!isDbConnected()) return null;
    const claim = await prisma.lostFoundClaim.findUnique({
      where: { id: claimId },
      include: { item: true },
    });

    if (!claim) throw new AppError('Claim not found', 404);

    const updatedClaim = await prisma.lostFoundClaim.update({
      where: { id: claimId },
      data: {
        status,
        moderatedById: moderatorId,
      },
    });

    if (status === 'APPROVED') {
      await prisma.lostFoundItem.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' },
      });
    }

    // Notify claimant of moderation decision
    await NotificationService.createNotification({
      userId: claim.claimantId,
      type: 'LOST_FOUND',
      title: `Lost & Found Claim ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      message: `Your claim for "${claim.item.title}" was ${status.toLowerCase()} by administration.`,
      referenceType: 'LOST_FOUND',
      referenceId: claim.itemId,
    });

    return updatedClaim;
  }
}
