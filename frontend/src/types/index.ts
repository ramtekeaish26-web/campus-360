export type RoleCode = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  degree: string;
  durationYears: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  prn?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  semester?: number | null;
  year?: number | null;
  rollNo?: string | null;
  departmentId?: string | null;
  programId?: string | null;
  department?: Department | null;
  program?: Program | null;
}

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  roles: RoleCode[];
  profile?: UserProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export * from './analytics.js';
export * from './notifications.js';
