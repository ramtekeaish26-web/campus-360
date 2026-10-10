export const ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const VALID_ROLES = Object.values(ROLES) as [RoleCode, ...RoleCode[]];
