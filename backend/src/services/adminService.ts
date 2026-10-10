import { prisma, isDbConnected } from '../config/db.js';
import { RoleCode } from '../constants/roles.js';
import { DEMO_FALLBACK_USERS } from './authService.js';

export class AdminService {
  /**
   * List all users with profiles, roles, departments, and programs (Admin only)
   */
  static async listUsers() {
    if (isDbConnected()) {
      try {
        const users = await prisma.user.findMany({
          include: {
            profile: {
              include: {
                department: true,
                program: true,
              },
            },
            userRoles: {
              include: {
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (users && users.length > 0) {
          return users.map((u) => ({
            id: u.id,
            email: u.email,
            isActive: u.isActive,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            roles: u.userRoles.map((ur) => ur.role.code as RoleCode),
            profile: u.profile
              ? {
                  id: u.profile.id,
                  firstName: u.profile.firstName,
                  lastName: u.profile.lastName,
                  prn: u.profile.prn,
                  phone: u.profile.phone,
                  bio: u.profile.bio,
                  avatarUrl: u.profile.avatarUrl,
                  semester: u.profile.semester,
                  year: u.profile.year,
                  rollNo: u.profile.rollNo,
                  department: u.profile.department
                    ? {
                        id: u.profile.department.id,
                        code: u.profile.department.code,
                        name: u.profile.department.name,
                      }
                    : null,
                  program: u.profile.program
                    ? {
                        id: u.profile.program.id,
                        code: u.profile.program.code,
                        name: u.profile.program.name,
                      }
                    : null,
                }
              : null,
          }));
        }
      } catch {
        // DB query error
      }
    }

    // Fallback list of users from DEMO_FALLBACK_USERS
    return Object.values(DEMO_FALLBACK_USERS).map((u) => ({
      id: u.id,
      email: u.email,
      isActive: u.isActive,
      roles: u.roles,
      profile: u.profile,
    }));
  }
}
