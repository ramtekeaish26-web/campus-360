import { prisma, isDbConnected } from '../config/db.js';

export class FeedbackService {
  static async submitFeedback(data: any, userId: string) {
    if (!isDbConnected()) return null;
    return await prisma.feedback.create({
      data: {
        ...data,
        userId,
        status: 'PUBLISHED',
      },
    });
  }

  static async getFeedback(params: {
    targetType?: string;
    targetId?: string;
    page?: number;
    limit?: number;
  }) {
    if (!isDbConnected()) return { feedback: [], total: 0, page: 1, totalPages: 0 };
    const { targetType, targetId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      feedback: items.map((f) => ({
        id: f.id,
        targetType: f.targetType,
        targetId: f.targetId,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt,
        user: {
          id: f.user.id,
          name: f.user.profile ? `${f.user.profile.firstName} ${f.user.profile.lastName}` : f.user.email,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
