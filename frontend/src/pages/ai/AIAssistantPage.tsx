import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { aiApi } from '../../services/aiApi.js';
import { AIChatMessage, AIPendingAction, AIConversationSummary } from '../../types/ai.js';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  BookOpen,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Plus,
  MessageSquare,
  Lock,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AIPendingAction | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { label: 'My Attendance', prompt: 'What is my current attendance percentage and summary?', icon: BookOpen },
    { label: 'Today Schedule', prompt: 'What classes do I have today on my timetable?', icon: Clock },
    { label: 'Find Library', prompt: 'Where is the Central Library located on campus?', icon: MapPin },
    { label: 'Exam Timetable', prompt: 'When are my upcoming autonomous examinations?', icon: Calendar },
    { label: 'ATKT Rules', prompt: 'What is the TGPCET policy for ATKT and grading criteria?', icon: Shield },
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      // Show default welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${user?.profile?.firstName || 'Student'}! I am **Campus Intelligence 360**, your secure institutional AI assistant for TGPCET. I have real-time access to your academic schedule, attendance records, exam schedules, campus spatial wayfinding, and official college regulations. How can I help you today?`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const list = await aiApi.getConversations();
      setConversations(list);
    } catch {
      // Fallback
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const msgs = await aiApi.getConversationMessages(convId);
      setMessages(msgs);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setError(null);
    setInputMessage('');

    // Optimistic user message
    const userMsg: AIChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await aiApi.sendMessage({
        message: text,
        conversationId: activeConversationId,
      });

      setMessages((prev) => [...prev, response.message]);
      if (response.conversationId && !activeConversationId) {
        setActiveConversationId(response.conversationId);
        loadConversations();
      }

      if (response.pendingAction) {
        setPendingAction(response.pendingAction);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get a response from Campus Intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (confirmed: boolean) => {
    if (!pendingAction || actionProcessing) return;
    setActionProcessing(true);
    try {
      const res = await aiApi.confirmAction(pendingAction.id, confirmed);
      setPendingAction(null);
      // Append confirmation result as assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `action-res-${Date.now()}`,
          role: 'assistant',
          content: confirmed
            ? `✅ **Action Confirmed:** ${res.message}`
            : `❌ **Action Cancelled:** You have cancelled the request.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to execute confirmation');
    } finally {
      setActionProcessing(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(undefined);
    setPendingAction(null);
    setError(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-surface-container-lowest overflow-hidden">
      {/* Sidebar: Conversation History */}
      <div className="hidden md:flex flex-col w-64 border-r border-surface-container bg-surface-container-low p-4 shrink-0">
        <button
          onClick={startNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-on-primary rounded-xl font-medium text-sm shadow-sm hover:opacity-95 transition-all mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>

        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-on-surface-variant">
            Recent Inquiries
          </span>
          <button onClick={loadConversations} className="text-on-surface-variant hover:text-on-surface">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-on-surface-variant">
              No previous conversations
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                className={`flex items-center gap-2 w-full p-2.5 rounded-lg text-left text-xs transition-colors ${
                  activeConversationId === c.id
                    ? 'bg-primary-container text-on-primary font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                <span className="truncate flex-1">{c.title || 'Institutional Inquiry'}</span>
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-surface-container text-[11px] text-on-surface-variant flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-secondary" />
          <span>Grounded & Secured AI</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-surface-container-lowest overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 border-b border-surface-container px-6 flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-sm text-on-surface">
                  Campus Intelligence 360
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  GEMINI 2.5 ACTIVE
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Authoritative AI Assistant for TGPCET Autonomous Campus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-xs">
              <Shield className="w-3.5 h-3.5 text-secondary" />
              Role: {user?.roles?.join(', ') || 'STUDENT'}
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="max-w-3xl mx-auto my-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-on-surface">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>Suggested Queries</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="flex items-start gap-2 p-3 text-left rounded-xl bg-surface-container-lowest border border-surface-container hover:border-secondary transition-all group"
                  >
                    <sp.icon className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:text-secondary" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                        {sp.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant line-clamp-1">
                        {sp.prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages List */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`flex flex-col rounded-2xl p-4 max-w-[85%] text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-sm shadow-sm'
                    : 'bg-surface-container-low border border-surface-container text-on-surface rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Grounded Sources Cited */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-container/60 space-y-1.5">
                    <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                      Authoritative Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-[11px] font-medium"
                        >
                          <BookOpen className="w-3 h-3 text-secondary" />
                          <span>{src.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Navigation Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((act, aIdx) => (
                      <a
                        key={aIdx}
                        href={act.target || '#'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-semibold text-[11px] hover:opacity-90 transition-all"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pending 2-Step Confirmation Action Card */}
          {pendingAction && (
            <div className="max-w-lg mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Action Requires Your Confirmation</span>
              </div>
              <p className="text-xs mb-3">{pendingAction.description}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConfirmAction(true)}
                  disabled={actionProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Execute</span>
                </button>
                <button
                  onClick={() => handleConfirmAction(false)}
                  disabled={actionProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-on-surface-variant font-medium ml-1">
                  Querying authoritative campus data...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-surface-container bg-surface-container-low shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your attendance, schedule, exams, campus map, or college rules..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-surface-container-lowest border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 rounded-xl bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AIAssistantPage;
