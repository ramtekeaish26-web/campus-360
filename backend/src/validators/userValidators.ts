import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name cannot be empty').max(100).optional(),
    lastName: z.string().min(1, 'Last name cannot be empty').max(100).optional(),
    phone: z.string().max(20, 'Phone number is too long').optional().nullable(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),
    avatarUrl: z.string().url('Avatar URL must be a valid URL').optional().nullable(),
  }).strict({
    message: 'Disallowed fields present. Only firstName, lastName, phone, bio, and avatarUrl may be updated.',
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
