import React, { useState, useEffect } from 'react';
import { Shield, Bell, Calendar, LifeBuoy, Package, Star, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { Notice, CampusEvent, ServiceRequest, LostFoundItem, Feedback } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';

export const AdminServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'notices' | 'events' | 'lostfound' | 'feedback'>('requests');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('GENERAL');
  const [noticePriority, setNoticePriority] = useState('NORMAL');
  const [noticeAudience, setNoticeAudience] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, notRes, evRes, lfRes, fbRes] = await Promise.all([
        servicesApi.getServiceRequests({ limit: 50 }),
        servicesApi.getNotices({ limit: 50 }),
        servicesApi.getEvents({ limit: 50 }),
        servicesApi.getLostFoundItems({ limit: 50 }),
        servicesApi.getFeedback({ limit: 50 }),
      ]);
      setRequests(reqRes.requests || []);
      setNotices(notRes.notices || []);
      setEvents(evRes.events || []);
      setLostFoundItems(lfRes.items || []);
      setFeedbackItems(fbRes.feedback || []);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await servicesApi.updateServiceRequestStatus(requestId, {
        status: newStatus,
        comment: `Admin updated status to ${newStatus}`,
      });
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update request');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await servicesApi.adminCreateNotice({
        title: noticeTitle,
        content: noticeContent,
        category: noticeCategory,
        priority: noticePriority,
        audience: noticeAudience,
      });
      setShowNoticeForm(false);
      setNoticeTitle('');
      setNoticeContent('');
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish notice');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            Campus Services & Operations Console
          </h1>
          <p className="text-sm text-slate-400">
            Administrative queue management, notice publishing, service ticket dispatch, and feedback review
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'requests', label: `Helpdesk Queue (${requests.length})`, icon: LifeBuoy },
          { id: 'notices', label: `Notices & Circulars (${notices.length})`, icon: Bell },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'lostfound', label: `Lost & Found (${lostFoundItems.length})`, icon: Package },
          { id: 'feedback', label: `Student Feedback (${feedbackItems.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === 'requests' ? (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200">Helpdesk Ticket Dispatch Queue</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} type="status" />
                    <StatusBadge status={r.priority} type="priority" />
                    <span className="text-xs font-bold text-slate-200">{r.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{r.description}</p>
                  <div className="text-2xs text-slate-500">
                    By: {r.requester.name} • Location: {r.locationDetails || r.building?.name || 'Campus'} •{' '}
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {r.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'ASSIGNED')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      Assign Ticket
                    </button>
                  )}
                  {r.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      Start Progress
                    </button>
                  )}
                  {r.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {r.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'CLOSED')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'notices' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">Campus Notices & Announcements</h2>
            <button
              onClick={() => setShowNoticeForm(!showNoticeForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Publish New Notice
            </button>
          </div>

          {showNoticeForm && (
            <form onSubmit={handleCreateNotice} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Publish Official Circular</h3>
              <input
                type="text"
                required
                placeholder="Notice Title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="GENERAL">General</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="EXAM">Exam</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <select
                  value={noticeAudience}
                  onChange={(e) => setNoticeAudience(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="ALL">All Campus</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                </select>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Notice full content and circular details..."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {notices.map((n) => (
              <div key={n.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={n.priority} type="priority" />
                    <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    Audience: {n.audience} • Published: {new Date(n.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'lostfound' ? (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200">Lost & Found Moderation</h2>
          <div className="space-y-3">
            {lostFoundItems.map((lf) => (
              <div key={lf.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">{lf.type}</span>
                    <span className="text-xs font-semibold text-slate-200">{lf.title}</span>
                    <StatusBadge status={lf.status} type="status" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{lf.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'feedback' ? (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200">Student & Campus Feedback Feed</h2>
          <div className="space-y-3">
            {feedbackItems.map((f) => (
              <div key={f.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{f.user.name}</span>
                  <span className="text-amber-400 font-bold">★ {f.rating} / 5</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{f.comment}</p>
                <div className="text-2xs text-slate-500">
                  Target: {f.targetType} {f.targetId ? `(${f.targetId})` : ''} • {new Date(f.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-200">Campus Events Manager</h2>
          {events.map((e) => (
            <div key={e.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">{e.title}</span>
                  <StatusBadge status={e.category} type="category" />
                </div>
                <div className="text-2xs text-slate-500 mt-1">
                  Venue: {e.venue || 'Campus'} • Date: {new Date(e.startDateTime).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
