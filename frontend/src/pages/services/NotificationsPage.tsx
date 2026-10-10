import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { notificationsApi } from '../../services/notificationsApi.js';
import {
  NotificationItem,
  NotificationType,
  NotificationPreferences,
  DailySummary,
  SmartRecommendation,
  AdminNotificationAudit,
  AdminBroadcastPreview,
} from '../../types/notifications.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import { Modal } from '../../components/ui/Modal.js';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  Send,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Eye,
  History,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [quietHoursActive, setQuietHoursActive] = useState(false);

  // Proactive summaries
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  // Preferences modal state
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Admin Broadcast state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'NOTICE' as NotificationType,
    priority: 'NORMAL' as const,
    targetAudience: 'ALL_STUDENTS',
    actionUrl: '',
    actionLabel: '',
  });
  const [broadcastPreview, setBroadcastPreview] = useState<AdminBroadcastPreview | null>(null);
  const [confirmedPublish, setConfirmedPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AdminNotificationAudit[]>([]);

  // AI query state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [notifRes, summaryRes, recsRes, prefRes] = await Promise.all([
        notificationsApi.getNotifications({
          type: selectedType !== 'ALL' ? (selectedType as NotificationType) : undefined,
          unreadOnly,
        }),
        notificationsApi.getDailySummary().catch(() => null),
        notificationsApi.getRecommendations().catch(() => ({ recommendations: [] })),
        notificationsApi.getPreferences().catch(() => null),
      ]);

      setNotifications(notifRes.notifications || []);
      setUnreadCount(notifRes.unreadCount || 0);
      setQuietHoursActive(!!notifRes.quietHoursActive);
      if (summaryRes) setDailySummary(summaryRes);
      if (recsRes?.recommendations) setRecommendations(recsRes.recommendations);
      if (prefRes?.preferences) setPreferences(prefRes.preferences);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [selectedType, unreadOnly]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    try {
      setIsSavingPrefs(true);
      const res = await notificationsApi.updatePreferences(preferences);
      setPreferences(res.preferences);
      setPrefsOpen(false);
      loadAllData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handlePreviewBroadcast = async () => {
    try {
      const res = await notificationsApi.adminPreviewBroadcast(broadcastForm);
      setBroadcastPreview(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate broadcast preview');
    }
  };

  const handlePublishBroadcast = async () => {
    if (!confirmedPublish) {
      alert('Please check the confirmation box before publishing institutional broadcasts.');
      return;
    }
    try {
      setIsPublishing(true);
      await notificationsApi.adminPublishBroadcast({
        ...broadcastForm,
        confirmed: true,
      });
      alert('Institutional notification successfully broadcasted!');
      setBroadcastOpen(false);
      setBroadcastPreview(null);
      setConfirmedPublish(false);
      setBroadcastForm({
        title: '',
        message: '',
        type: 'NOTICE',
        priority: 'NORMAL',
        targetAudience: 'ALL_STUDENTS',
        actionUrl: '',
        actionLabel: '',
      });
      loadAllData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLoadAuditLogs = async () => {
    try {
      const res = await notificationsApi.adminGetAuditLogs();
      setAuditLogs(res.auditLogs || []);
      setAuditLogsOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    }
  };

  const handleAiAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || aiQuestion;
    if (!q.trim()) return;

    setIsAiLoading(true);
    try {
      const res = await notificationsApi.explain(q);
      setAiAnswer(res.answer);
    } catch {
      setAiAnswer('Unable to generate notification explanation at this moment.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const categories: Array<{ label: string; value: string }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Academic', value: 'ACADEMIC' },
    { label: 'Events', value: 'EVENT' },
    { label: 'Notices', value: 'NOTICE' },
    { label: 'Helpdesk', value: 'SERVICE_REQUEST' },
    { label: 'Campus', value: 'CAMPUS' },
    { label: 'System', value: 'SYSTEM' },
    { label: 'Reminders', value: 'REMINDER' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-container via-[#1E3A5F] to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                PHASE 7 PROACTIVE ENGINE
              </Badge>
              {quietHoursActive && (
                <Badge variant="neutral" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                  <Moon className="w-3 h-3" /> Quiet Hours Active
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Bell className="w-7 h-7 text-secondary-container" />
              Smart Campus Notification Center
            </h1>
            <p className="text-primary-fixed-dim text-sm max-w-2xl">
              Personalized deadlines, schedule alerts, ticket resolution notifications, and institutional announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrefsOpen(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              Preferences
            </Button>

            {isAdmin && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setBroadcastOpen(true)}
                  className="bg-secondary text-on-secondary font-bold hover:bg-secondary/90 shadow-sm"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Broadcast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadAuditLogs}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <History className="w-4 h-4 mr-1.5" />
                  Audit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 1. PERSONALIZED DAILY CAMPUS SUMMARY */}
      {dailySummary && (
        <Card className="border-l-4 border-l-primary bg-surface-dim/40 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-on-surface">{dailySummary.greeting}</h3>
                </div>
                <p className="text-xs text-outline leading-relaxed max-w-3xl">
                  {dailySummary.summaryText}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/30">
                  <span className="text-lg font-bold text-primary">{dailySummary.classesToday}</span>
                  <p className="text-[10px] text-outline">Classes</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/30">
                  <span className="text-lg font-bold text-amber-500">{dailySummary.pendingDeadlines}</span>
                  <p className="text-[10px] text-outline">Deadlines</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/30">
                  <span className="text-lg font-bold text-green-600">{dailySummary.registeredEvents}</span>
                  <p className="text-[10px] text-outline">Events</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. PROACTIVE SMART RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-outline flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Smart Context Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className={`border-l-4 transition-all hover:shadow-md ${
                  rec.priority === 'HIGH' ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-primary bg-primary/5'
                }`}
              >
                <CardContent className="p-4 space-y-2 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <Badge variant={rec.priority === 'HIGH' ? 'warning' : 'neutral'} size="sm">
                        {rec.category}
                      </Badge>
                      {rec.priority === 'HIGH' && (
                        <span className="text-[10px] font-bold text-amber-500 uppercase">Action Needed</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-on-surface mt-2">{rec.title}</h4>
                    <p className="text-[11px] text-outline mt-1 leading-relaxed">{rec.description}</p>
                  </div>
                  {rec.actionUrl && (
                    <Link
                      to={rec.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 pt-2"
                    >
                      <span>{rec.actionLabel || 'View'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. AI NOTIFICATION ASSISTANT QUERY BAR */}
      <Card className="border border-primary/20 bg-surface-dim/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <Sparkles className="w-4 h-4 text-primary" />
              Ask AI About Today's Alerts & Deadlines
            </div>
            <span className="text-[10px] text-outline font-mono">Grounded in verified notifications</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'What should I know today?',
              'Do I have any pending assignments due?',
              'What are my upcoming events this week?',
              'Summarize my unread campus notifications.',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setAiQuestion(chip);
                  handleAiAsk(chip);
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/30"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              placeholder="Ask about your deadlines, classes, or alerts..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-outline bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="sm" onClick={() => handleAiAsk()} disabled={isAiLoading || !aiQuestion.trim()}>
              {isAiLoading ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {isAiLoading && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
              <Spinner size="sm" /> Summarizing your verified campus alerts...
            </div>
          )}

          {aiAnswer && !isAiLoading && (
            <div className="p-3.5 rounded-xl bg-surface-dim border border-outline-variant/40 space-y-1.5 text-xs text-on-surface whitespace-pre-line leading-relaxed">
              {aiAnswer}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. NOTIFICATION CENTER TOOLBAR & FILTER TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold font-mono">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-outline cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
              />
              Unread only
            </label>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedType(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedType === c.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. NOTIFICATION ITEMS LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load notifications" message={error} onRetry={loadAllData} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-surface-dim/30 border border-outline-variant/30 rounded-2xl p-8">
          <Bell className="w-12 h-12 text-outline mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-on-surface mb-1">No notifications found</h3>
          <p className="text-xs text-outline max-w-sm mx-auto">
            {unreadOnly
              ? 'You have caught up on all unread notifications.'
              : 'No alerts match the selected category filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const priorityBadgeMap = {
              URGENT: { variant: 'error' as const, label: 'URGENT' },
              HIGH: { variant: 'warning' as const, label: 'HIGH' },
              NORMAL: { variant: 'primary' as const, label: 'NORMAL' },
              LOW: { variant: 'neutral' as const, label: 'INFO' },
            };

            const pBadge = priorityBadgeMap[n.priority] || priorityBadgeMap.NORMAL;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-surface border-primary/40 shadow-sm ring-1 ring-primary/20 border-l-4 border-l-primary'
                    : 'bg-surface-dim/30 border-outline-variant/30'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={pBadge.variant} size="sm">
                      {pBadge.label}
                    </Badge>
                    <span className="text-xs font-mono text-outline font-semibold uppercase">
                      {n.type}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <span className="text-sm font-bold text-on-surface truncate">{n.title}</span>
                  </div>

                  <p className="text-xs text-outline leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-outline pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.actionUrl && (
                      <Link
                        to={n.actionUrl}
                        className="font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        {n.actionLabel || 'View Action'} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-2 rounded-lg bg-surface-variant hover:bg-primary/10 text-outline hover:text-primary transition-colors shrink-0 self-end sm:self-center"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PREFERENCES MODAL */}
      <Modal
        isOpen={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Notification Preferences & Quiet Hours"
      >
        {preferences && (
          <div className="space-y-4">
            <p className="text-xs text-outline">
              Control which categories trigger in-app alerts and configure quiet hours. Mandatory security and urgent notifications always bypass quiet hours.
            </p>

            <div className="space-y-2 border-y border-outline-variant/30 py-3">
              {[
                { key: 'academicEnabled', label: 'Academic Deadlines & Classes' },
                { key: 'eventsEnabled', label: 'Campus Events & Fests' },
                { key: 'noticesEnabled', label: 'Institutional Notices & Circulars' },
                { key: 'servicesEnabled', label: 'Helpdesk & Ticket Progress' },
                { key: 'campusEnabled', label: 'Campus Navigation & Facility Alerts' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-on-surface py-1 cursor-pointer">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(preferences as any)[item.key]}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              ))}
            </div>

            {/* Quiet Hours */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-on-surface cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-amber-500" />
                  Enable Notification Quiet Hours
                </span>
                <input
                  type="checkbox"
                  checked={preferences.quietHoursEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quietHoursEnabled: e.target.checked,
                    })
                  }
                  className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                />
              </label>

              {preferences.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-outline">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHoursStart}
                      onChange={(e) =>
                        setPreferences({ ...preferences, quietHoursStart: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-outline bg-surface text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-outline">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHoursEnd}
                      onChange={(e) =>
                        setPreferences({ ...preferences, quietHoursEnd: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-outline bg-surface text-xs mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPrefsOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSavePreferences} disabled={isSavingPrefs}>
                {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADMIN BROADCAST MODAL */}
      {isAdmin && (
        <Modal
          isOpen={broadcastOpen}
          onClose={() => {
            setBroadcastOpen(false);
            setBroadcastPreview(null);
            setConfirmedPublish(false);
          }}
          title="Administrative Institutional Broadcast"
        >
          <div className="space-y-4">
            <p className="text-xs text-outline">
              Create and dispatch an authorized broadcast notification to campus cohorts. Explicit confirmation is required before dispatch.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-outline">Broadcast Title</label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. End Semester Examination Hall Tickets Released"
                  className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-outline">Message Body</label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  rows={3}
                  placeholder="Enter institutional announcement details..."
                  className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-outline">Category</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                  >
                    <option value="NOTICE">NOTICE</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="EVENT">EVENT</option>
                    <option value="CAMPUS">CAMPUS</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="SECURITY">SECURITY</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-outline">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-outline">Target Cohort</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                  >
                    <option value="ALL_STUDENTS">All Students (1,420)</option>
                    <option value="ALL_FACULTY">All Faculty (86)</option>
                    <option value="ALL_CAMPUS">Entire Campus (1,506)</option>
                    <option value="DEPARTMENT_CSE">Dept of CSE (420)</option>
                    <option value="SEMESTER_6">Semester 6 Cohort (340)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-outline">Action Route (Optional)</label>
                  <input
                    type="text"
                    value={broadcastForm.actionUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, actionUrl: e.target.value })}
                    placeholder="/notices or /academic/exams"
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline">Action Label (Optional)</label>
                  <input
                    type="text"
                    value={broadcastForm.actionLabel}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, actionLabel: e.target.value })}
                    placeholder="Read Circular"
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {broadcastPreview ? (
              <div className="p-4 rounded-xl bg-surface-dim border border-primary/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Live Audience Preview
                  </span>
                  <Badge variant="primary" size="sm">
                    {broadcastPreview.preview.estimatedRecipients} Estimated Recipients
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-on-surface">{broadcastPreview.preview.title}</h4>
                <p className="text-xs text-outline">{broadcastPreview.preview.message}</p>

                <div className="pt-3 border-t border-outline-variant/30 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmBroadcast"
                    checked={confirmedPublish}
                    onChange={(e) => setConfirmedPublish(e.target.checked)}
                    className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
                  />
                  <label htmlFor="confirmBroadcast" className="text-xs font-bold text-on-surface cursor-pointer">
                    I confirm that this institutional broadcast is verified and approved for immediate dispatch.
                  </label>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewBroadcast}
                disabled={!broadcastForm.title || !broadcastForm.message}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Broadcast Preview
              </Button>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBroadcastOpen(false);
                  setBroadcastPreview(null);
                  setConfirmedPublish(false);
                }}
              >
                Cancel
              </Button>
              {broadcastPreview && (
                <Button
                  size="sm"
                  onClick={handlePublishBroadcast}
                  disabled={!confirmedPublish || isPublishing}
                >
                  {isPublishing ? 'Broadcasting...' : 'Publish Institutional Notification'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADMIN AUDIT LOG DRAWER */}
      {isAdmin && (
        <Modal
          isOpen={auditLogsOpen}
          onClose={() => setAuditLogsOpen(false)}
          title="Institutional Broadcast Audit Log"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-outline py-8 text-center">No broadcast audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-dim/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">
                      {log.targetAudience}
                    </Badge>
                    <span className="text-[10px] font-mono text-outline">
                      {new Date(log.publishedAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-on-surface">{log.title}</h4>
                  <p className="text-[11px] text-outline">{log.message}</p>
                  <p className="text-[10px] text-outline font-mono pt-1">
                    Dispatched to {log.recipientCount} users by {log.adminEmail}
                  </p>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotificationsPage;
