export type AIUserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface AIUserContext {
  id: string;
  email: string;
  roles: AIUserRole[];
  name?: string;
  departmentCode?: string;
  departmentName?: string;
  semester?: number;
  year?: number;
}

export type AIActionType =
  | 'NAVIGATE'
  | 'OPEN_PAGE'
  | 'CONFIRM_WRITE'
  | 'CREATE_SERVICE_REQUEST'
  | 'REGISTER_EVENT'
  | 'JOIN_CLUB';

export interface AIAction {
  id?: string;
  type: AIActionType;
  label: string;
  target?: string;
  payload?: Record<string, any>;
  requiresConfirmation?: boolean;
}

export interface AISourceReference {
  type: 'ACADEMIC' | 'SPATIAL' | 'NOTICE' | 'EVENT' | 'SERVICE' | 'KNOWLEDGE_DOC' | 'SYSTEM';
  title: string;
  url?: string;
  snippet?: string;
}

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'model' | 'system';
  content: string;
  sources?: AISourceReference[];
  actions?: AIAction[];
  toolsUsed?: string[];
  createdAt?: string;
}

export interface AIChatResponseData {
  conversationId: string;
  message: string;
  sources: AISourceReference[];
  actions: AIAction[];
  pendingAction?: {
    actionId: string;
    actionType: string;
    summary: string;
    expiresAt: string;
  } | null;
  toolsUsed: string[];
}

export interface AIToolResult {
  toolName: string;
  success: boolean;
  data: any;
  sourcesCited?: AISourceReference[];
  suggestedActions?: AIAction[];
}
