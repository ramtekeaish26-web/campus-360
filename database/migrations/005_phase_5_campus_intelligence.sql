-- ============================================================================
-- CAMPUS 360 — PHASE 5 MIGRATION: CAMPUS INTELLIGENCE & GEMINI
-- ============================================================================

-- 1. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- 2. CONVERSATION MESSAGES
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),
    content TEXT NOT NULL,
    sources JSONB,
    actions JSONB,
    tools_used JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conv ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_created ON conversation_messages(created_at ASC);

-- 3. KNOWLEDGE DOCUMENTS (Institutional Policies & Guidelines)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    audience VARCHAR(20) NOT NULL DEFAULT 'ALL' CHECK (audience IN ('ALL', 'STUDENT', 'FACULTY', 'ADMIN')),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_audience ON knowledge_documents(audience);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_slug ON knowledge_documents(slug);

-- 4. KNOWLEDGE CHUNKS (RAG & Retrieval Subsystem)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON knowledge_chunks(document_id);

-- 5. AI PENDING ACTIONS (2-Step Human Confirmation for Write Operations)
CREATE TABLE IF NOT EXISTS ai_pending_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    target_data JSONB NOT NULL,
    summary TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_pending_user ON ai_pending_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_pending_status ON ai_pending_actions(status);

-- 6. AI AUDIT LOGS
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    query_intent VARCHAR(100),
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    tools_used JSONB,
    sources_cited JSONB,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_user ON ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_created ON ai_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_status ON ai_audit_logs(status);
