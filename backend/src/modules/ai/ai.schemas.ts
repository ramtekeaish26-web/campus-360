import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 chars)'),
  conversationId: z.string().min(1).optional(),
});

export const confirmActionSchema = z.object({
  actionId: z.string().min(1, 'Action ID is required'),
  decision: z.enum(['CONFIRM', 'CANCEL']),
});

export const knowledgeQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500),
  category: z.string().optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ConfirmActionInput = z.infer<typeof confirmActionSchema>;
