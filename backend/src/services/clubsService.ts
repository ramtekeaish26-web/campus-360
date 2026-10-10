import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export class ClubsService {
  static async getClubs(params: {
    category?: string;
    search?: string;
    userId?: string;
  }) {
    if (!isDbConnected()) return [];
    const { category, search, userId } = params;

    const where: any = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        memberships: {
          select: { id: true, userId: true, role: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return clubs.map((c) => {
      const activeMembers = c.memberships.filter((m) => m.status === 'ACTIVE');
      const userMembership = userId ? c.memberships.find((m) => m.userId === userId && m.status === 'ACTIVE') : null;

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        logo: c.logo,
        department: c.department,
        memberCount: activeMembers.length,
        isMember: !!userMembership,
        userRole: userMembership?.role || null,
        createdAt: c.createdAt,
      };
    });
  }

  static async getClubBySlug(slug: string, userId?: string) {
    if (!isDbConnected()) return null;
    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        department: { select: { id: true, name: true, code: true } },
        creator: { include: { profile: true } },
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            user: { include: { profile: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!club) return null;

    const userMembership = userId ? club.memberships.find((m) => m.userId === userId) : null;

    return {
      id: club.id,
      name: club.name,
      slug: club.slug,
      description: club.description,
      category: club.category,
      logo: club.logo,
      status: club.status,
      department: club.department,
      memberCount: club.memberships.length,
      isMember: !!userMembership,
      userRole: userMembership?.role || null,
      members: club.memberships.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        name: m.user.profile ? `${m.user.profile.firstName} ${m.user.profile.lastName}` : m.user.email,
        email: m.user.email,
      })),
      createdAt: club.createdAt,
    };
  }

  static async joinClub(clubId: string, userId: string) {
    if (!isDbConnected()) return null;
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new AppError('Club not found', 404);

    return await prisma.clubMembership.upsert({
      where: {
        clubId_userId: { clubId, userId },
      },
      update: {
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
      create: {
        clubId,
        userId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });
  }

  static async leaveClub(clubId: string, userId: string) {
    if (!isDbConnected()) return null;
    const membership = await prisma.clubMembership.findUnique({
      where: {
        clubId_userId: { clubId, userId },
      },
    });

    if (!membership) throw new AppError('You are not a member of this club', 404);

    return await prisma.clubMembership.update({
      where: {
        clubId_userId: { clubId, userId },
      },
      data: {
        status: 'LEFT',
      },
    });
  }

  static async createClub(data: any, createdBy: string) {
    if (!isDbConnected()) return null;
    const existing = await prisma.club.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('Club with this slug already exists', 400);

    const club = await prisma.club.create({
      data: {
        ...data,
        createdBy,
      },
    });

    // Creator becomes club LEAD/ADMIN
    await prisma.clubMembership.create({
      data: {
        clubId: club.id,
        userId: createdBy,
        role: 'LEAD',
        status: 'ACTIVE',
      },
    });

    return club;
  }

  static async updateClub(id: string, data: any) {
    if (!isDbConnected()) return null;
    return await prisma.club.update({
      where: { id },
      data,
    });
  }
}
