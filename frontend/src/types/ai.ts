export interface AISourceReference {
  type: 'ACADEMIC' | 'SPATIAL' | 'NOTICE' | 'EVENT' | 'SERVICE' | 'KNOWLEDGE_DOC';
  title: string;
  url?: string;
  snippet?: string;
}

export interface AIAction {
  type: 'NAVIGATE' | 'OPEN_PAGE' | 'PREFILL_FORM' | 'CONFIRM_MUTATION';
  label: string;
  target?: string;
  payload?: any;
}

export interface AIPendingAction {
  id: string;
  actionType: 'CREATE_SERVICE_REQUEST' | 'REGISTER_EVENT' | 'JOIN_CLUB';
  description: string;
  payload: any;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  expiresAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: AISourceReference[];
  actions?: AIAction[];
  pendingAction?: AIPendingAction | null;
  toolsExecuted?: string[];
  createdAt: string;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface AIAuditLogEntry {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  conversationId: string;
  toolsInvoked: string[];
  latencyMs: number;
  flaggedPolicy: boolean;
  modelUsed: string;
  createdAt: string;
}

export interface AIStats {
  totalQueries: number;
  toolInvocations: number;
  policyBlocks: number;
  averageLatencyMs: number;
}
