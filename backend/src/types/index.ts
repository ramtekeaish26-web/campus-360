import { Request } from 'express';
import { RoleCode } from '../constants/roles.js';

export interface ApiResponseSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface ApiResponseError {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: RoleCode[];
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    prn?: string | null;
    avatarUrl?: string | null;
    departmentId?: string | null;
    programId?: string | null;
  } | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleCode[];
  iat?: number;
  exp?: number;
  iss?: string;
}
