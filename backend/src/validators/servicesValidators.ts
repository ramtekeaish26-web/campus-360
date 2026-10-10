import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(3).max(255),
  summary: z.string().max(500).optional(),
  content: z.string().min(5),
  category: z.enum(['ACADEMIC', 'EXAM', 'ADMINISTRATIVE', 'DEPARTMENT', 'GENERAL', 'EMERGENCY']).default('GENERAL'),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  audience: z.enum(['ALL', 'STUDENT', 'FACULTY', 'ADMIN']).default('ALL'),
  departmentId: z.string().uuid().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(5),
  category: z.enum(['ACADEMIC', 'CULTURAL', 'SPORTS', 'TECHNICAL', 'WORKSHOP', 'SEMINAR', 'CLUB', 'OTHER']).default('OTHER'),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  locationId: z.string().uuid().optional().nullable(),
  venue: z.string().max(255).optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  registrationRequired: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).default('PUBLISHED'),
  image: z.string().url().or(z.string().max(512)).optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();

export const createClubSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  description: z.string().min(5),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'SOCIAL', 'OTHER']).default('TECHNICAL'),
  departmentId: z.string().uuid().optional().nullable(),
  logo: z.string().url().or(z.string().max(512)).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateClubSchema = createClubSchema.partial();

export const createServiceRequestSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(5),
  category: z.enum(['ELECTRICAL', 'PROJECTOR', 'WIFI', 'CLEANLINESS', 'WATER', 'FURNITURE', 'INFRASTRUCTURE', 'GENERAL']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  locationId: z.string().uuid().optional().nullable(),
  buildingId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  locationDetails: z.string().max(255).optional().nullable(),
  assignedDepartmentId: z.string().uuid().optional().nullable(),
});

export const updateServiceRequestStatusSchema = z.object({
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
  assignedTo: z.string().uuid().optional().nullable(),
  assignedDepartmentId: z.string().uuid().optional().nullable(),
  comment: z.string().max(1000).optional(),
});

export const createServiceRequestCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  isInternal: z.boolean().default(false),
});

export const createLostFoundItemSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3).max(255),
  description: z.string().min(5),
  category: z.enum(['ID_DOCUMENT', 'ELECTRONICS', 'BOOK', 'CLOTHING', 'ACCESSORY', 'OTHER']).default('OTHER'),
  locationId: z.string().uuid().optional().nullable(),
  locationText: z.string().max(255).optional().nullable(),
  itemDate: z.string().datetime().optional(),
  image: z.string().max(512).optional().nullable(),
});

export const createLostFoundClaimSchema = z.object({
  description: z.string().min(5).max(1000),
  contactInfo: z.string().min(3).max(255),
});

export const moderateLostFoundClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const createEmergencyContactSchema = z.object({
  name: z.string().min(2).max(255),
  category: z.enum(['SECURITY', 'MEDICAL', 'FIRE', 'DISASTER', 'HELPLINE', 'ADMIN']).default('SECURITY'),
  phone: z.string().min(3).max(50),
  altPhone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  locationText: z.string().max(255).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
  priority: z.number().int().default(1),
  isDemo: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateEmergencyContactSchema = createEmergencyContactSchema.partial();

export const createFeedbackSchema = z.object({
  targetType: z.enum(['SERVICE', 'EVENT', 'FACILITY', 'GENERAL', 'HELPDESK']),
  targetId: z.string().max(255).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(2000),
});
