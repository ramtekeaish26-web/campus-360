import { prisma, isDbConnected } from '../config/db.js';
import { NotificationService } from './notificationService.js';

export class NoticesService {
  static async getNotices(params: {
    role?: string;
    userId?: string;
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (!isDbConnected()) return { notices: [], total: 0, page: 1, totalPages: 0 };
    const { role = 'ALL', userId, category, priority, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (role !== 'ADMIN') {
      where.audience = {
        in: ['ALL', role],
      };
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
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rawNotices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          author: {
            include: { profile: true },
          },
          department: true,
          reads: userId
            ? {
                where: { userId },
                select: { readAt: true },
              }
            : false,
        },
        orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ]);

    const notices = rawNotices.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      content: n.content,
      category: n.category,
      priority: n.priority,
      publishedAt: n.publishedAt,
      expiresAt: n.expiresAt,
      status: n.status,
      audience: n.audience,
      author: {
        id: n.author.id,
        name: n.author.profile ? `${n.author.profile.firstName} ${n.author.profile.lastName}` : n.author.email,
        email: n.author.email,
      },
      department: n.department ? { id: n.department.id, name: n.department.name, code: n.department.code } : null,
      isRead: userId ? n.reads && n.reads.length > 0 : false,
      createdAt: n.createdAt,
    }));

    return {
      notices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getNoticeById(id: string, userId?: string) {
    if (!isDbConnected()) return null;
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        author: {
          include: { profile: true },
        },
        department: true,
        reads: userId
          ? {
              where: { userId },
              select: { readAt: true },
            }
          : false,
      },
    });

    if (!notice) return null;

    // Automatically mark as read if userId provided
    if (userId) {
      await prisma.noticeRead.upsert({
        where: {
          noticeId_userId: {
            noticeId: id,
            userId,
          },
        },
        update: { readAt: new Date() },
        create: {
          noticeId: id,
          userId,
        },
      }).catch(() => {});
    }

    return {
      ...notice,
      author: {
        id: notice.author.id,
        name: notice.author.profile ? `${notice.author.profile.firstName} ${notice.author.profile.lastName}` : notice.author.email,
        email: notice.author.email,
      },
      isRead: true,
    };
  }

  static async markNoticeAsRead(noticeId: string, userId: string) {
    if (!isDbConnected()) return null;
    return await prisma.noticeRead.upsert({
      where: {
        noticeId_userId: {
          noticeId,
          userId,
        },
      },
      update: { readAt: new Date() },
      create: {
        noticeId,
        userId,
      },
    });
  }

  static async createNotice(data: any, authorId: string) {
    if (!isDbConnected()) return null;
    const notice = await prisma.notice.create({
      data: {
        ...data,
        authorId,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        author: { include: { profile: true } },
      },
    });

    // If URGENT or IMPORTANT, notify all users matching audience
    if (notice.priority === 'URGENT' || notice.priority === 'IMPORTANT') {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, userRoles: { include: { role: true } } },
      });

      const eligibleUserIds = users
        .filter((u) => {
          if (notice.audience === 'ALL') return true;
          return u.userRoles.some((r) => r.role.code === notice.audience);
        })
        .map((u) => u.id);

      await NotificationService.notifyAudience(
        eligibleUserIds,
        'NOTICE',
        `Important Notice: ${notice.title}`,
        notice.summary || notice.content.substring(0, 120),
        'NOTICE',
        notice.id
      );
    }

    return notice;
  }

  static async updateNotice(id: string, data: any) {
    if (!isDbConnected()) return null;
    return await prisma.notice.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  static async deleteNotice(id: string) {
    if (!isDbConnected()) return null;
    return await prisma.notice.delete({
      where: { id },
    });
  }
}
