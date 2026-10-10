import jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { RoleCode, ROLES } from '../constants/roles.js';
import { LoginInput } from '../validators/authValidators.js';

let supabaseClient: SupabaseClient | null = null;
if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// In-memory fallback demo users
export const DEMO_FALLBACK_USERS: Record<
  string,
  {
    id: string;
    email: string;
    isActive: boolean;
    roles: RoleCode[];
    profile: {
      id: string;
      firstName: string;
      lastName: string;
      prn: string;
      phone?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      department: { id: string; code: string; name: string };
      program?: { id: string; code: string; name: string } | null;
    };
  }
> = {
  'student@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'student@demo.local',
    isActive: true,
    roles: [ROLES.STUDENT],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000001',
      firstName: 'Aarav',
      lastName: 'Deshmukh',
      prn: '202201640049281',
      phone: '+91 98765 43210',
      bio: 'Final-Year B.Tech Candidate (CSE) • IoT, Distributed Systems & Edge Computing Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      program: {
        id: 'c0000000-0000-0000-0000-000000000001',
        code: 'BTECH_CSE',
        name: 'B.Tech in Computer Science & Engineering',
      },
    },
  },
  'faculty@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000002',
    email: 'faculty@demo.local',
    isActive: true,
    roles: [ROLES.FACULTY],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000002',
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      prn: 'FAC-CSE-104',
      phone: '+91 98765 43211',
      bio: 'Associate Professor, Department of Computer Science & Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      program: null,
    },
  },
  'student2@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000004',
    email: 'student2@demo.local',
    isActive: true,
    roles: [ROLES.STUDENT],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000004',
      firstName: 'Priya',
      lastName: 'Patel',
      prn: '202201640049282',
      phone: '+91 98765 43215',
      bio: 'Third Year B.Tech CSE • AI & Systems Enthusiast',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      program: {
        id: 'c0000000-0000-0000-0000-000000000001',
        code: 'BTECH_CSE',
        name: 'B.Tech in Computer Science & Engineering',
      },
    },
  },
  'student3@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000005',
    email: 'student3@demo.local',
    isActive: true,
    roles: [ROLES.STUDENT],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000005',
      firstName: 'Rohan',
      lastName: 'Verma',
      prn: '202201640049283',
      phone: '+91 98765 43216',
      bio: 'Third Year B.Tech Mechanical • CAD & Automation Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000002',
        code: 'MECH',
        name: 'Mechanical Engineering',
      },
      program: {
        id: 'c0000000-0000-0000-0000-000000000002',
        code: 'BTECH_MECH',
        name: 'B.Tech in Mechanical Engineering',
      },
    },
  },
  'faculty2@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000006',
    email: 'faculty2@demo.local',
    isActive: true,
    roles: [ROLES.FACULTY],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000006',
      firstName: 'Prof. Sneha',
      lastName: 'Kulkarni',
      prn: 'FAC-CSE-105',
      phone: '+91 98765 43218',
      bio: 'Assistant Professor, Algorithms & Network Architecture',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      program: null,
    },
  },
  'admin@demo.local': {
    id: 'd0000000-0000-0000-0000-000000000003',
    email: 'admin@demo.local',
    isActive: true,
    roles: [ROLES.ADMIN],
    profile: {
      id: 'e0000000-0000-0000-0000-000000000003',
      firstName: 'Admin',
      lastName: 'Officer',
      prn: 'ADM-TGPCET-01',
      phone: '+91 98765 43212',
      bio: 'Autonomous Examination Cell & Systems Administrator',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      department: {
        id: 'b0000000-0000-0000-0000-000000000001',
        code: 'CSE',
        name: 'Computer Science & Engineering',
      },
      program: null,
    },
  },
};

export class AuthService {
  static async login(input: LoginInput) {
    const { email, password } = input;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. If Supabase client configured, attempt Supabase Auth first
    if (supabaseClient && !normalizedEmail.endsWith('@demo.local')) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw new AppError(error.message, 401, ERROR_CODES.AUTHENTICATION_FAILED);
      }

      if (!data.user) {
        throw new AppError('Authentication failed', 401, ERROR_CODES.AUTHENTICATION_FAILED);
      }

      const user = await AuthService.getOrCreateUser(data.user.id, normalizedEmail);
      const token = data.session?.access_token || AuthService.generateJwt(user.id, user.email, user.roles);

      return {
        user,
        token,
        expiresIn: data.session?.expires_in || 604800,
      };
    }

    // 2. Demo accounts / development fallback
    const demoUser = DEMO_FALLBACK_USERS[normalizedEmail];
    if (demoUser) {
      if (!password || password.length === 0) {
        throw new AppError('Password is required', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      let user = null;
      if (isDbConnected()) {
        try {
          user = await AuthService.getUserWithDetails(demoUser.id, normalizedEmail);
        } catch {
          // ignore
        }
      }

      if (!user) {
        user = demoUser;
      }

      const token = AuthService.generateJwt(user.id, user.email, user.roles);

      return {
        user,
        token,
        expiresIn: 604800,
      };
    }

    // 3. Database lookup for other users
    if (isDbConnected()) {
      try {
        const user = await AuthService.getUserWithDetails(undefined, normalizedEmail);
        if (user) {
          const token = AuthService.generateJwt(user.id, user.email, user.roles);
          return {
            user,
            token,
            expiresIn: 604800,
          };
        }
      } catch {
        // ignore
      }
    }

    throw new AppError('Invalid email or password', 401, ERROR_CODES.AUTHENTICATION_FAILED);
  }

  static generateJwt(userId: string, email: string, roles: RoleCode[]): string {
    const secret = env.SUPABASE_JWT_SECRET || env.JWT_SECRET;
    return jwt.sign(
      {
        sub: userId,
        email,
        roles,
      },
      secret,
      {
        expiresIn: '7d',
        issuer: 'campus-360',
      }
    );
  }

  static async getUserWithDetails(userId?: string, email?: string) {
    if (!userId && !email) return null;

    if (isDbConnected()) {
      try {
        const userRecord = await prisma.user.findFirst({
          where: {
            ...(userId && { id: userId }),
            ...(email && { email }),
          },
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
        });

        if (userRecord) {
          return {
            id: userRecord.id,
            email: userRecord.email,
            isActive: userRecord.isActive,
            createdAt: userRecord.createdAt,
            updatedAt: userRecord.updatedAt,
            roles: userRecord.userRoles.map((ur) => ur.role.code as RoleCode),
            profile: userRecord.profile
              ? {
                  id: userRecord.profile.id,
                  firstName: userRecord.profile.firstName,
                  lastName: userRecord.profile.lastName,
                  prn: userRecord.profile.prn,
                  phone: userRecord.profile.phone,
                  bio: userRecord.profile.bio,
                  avatarUrl: userRecord.profile.avatarUrl,
                  semester: userRecord.profile.semester,
                  year: userRecord.profile.year,
                  rollNo: userRecord.profile.rollNo,
                  department: userRecord.profile.department
                    ? {
                        id: userRecord.profile.department.id,
                        code: userRecord.profile.department.code,
                        name: userRecord.profile.department.name,
                      }
                    : null,
                  program: userRecord.profile.program
                    ? {
                        id: userRecord.profile.program.id,
                        code: userRecord.profile.program.code,
                        name: userRecord.profile.program.name,
                      }
                    : null,
                }
              : null,
          };
        }
      } catch {
        // DB failed
      }
    }

    // Match in demo fallback users
    const fallbackUser = Object.values(DEMO_FALLBACK_USERS).find(
      (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    return fallbackUser || null;
  }

  private static async getOrCreateUser(supabaseId: string, email: string) {
    let user = await AuthService.getUserWithDetails(supabaseId, email);
    if (!user) {
      if (isDbConnected()) {
        try {
          const studentRole = await prisma.role.findUnique({ where: { code: ROLES.STUDENT } });
          const created = await prisma.user.create({
            data: {
              id: supabaseId,
              email,
              isActive: true,
              profile: {
                create: {
                  firstName: email.split('@')[0],
                  lastName: 'User',
                },
              },
              ...(studentRole && {
                userRoles: {
                  create: {
                    roleId: studentRole.id,
                  },
                },
              }),
            },
            include: {
              profile: {
                include: { department: true, program: true },
              },
              userRoles: { include: { role: true } },
            },
          });
          return {
            id: created.id,
            email: created.email,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            roles: created.userRoles.map((ur) => ur.role.code as RoleCode),
            profile: created.profile,
          };
        } catch {
          // ignore
        }
      }
      return {
        id: supabaseId,
        email,
        isActive: true,
        roles: [ROLES.STUDENT],
        profile: null,
      };
    }
    return user;
  }
}
