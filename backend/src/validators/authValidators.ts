import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['STUDENT', 'FACULTY', 'ADMIN']).optional(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
