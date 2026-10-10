import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LifeBuoy, ArrowLeft, Send, CheckCircle, Clock, MapPin, User, MessageSquare, History, Star } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { ServiceRequest } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';
import { FeedbackModal } from '../../components/services/FeedbackModal.js';

export const ServiceRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const loadRequest = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await servicesApi.getServiceRequestById(id);
      setRequest(res.request);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load service request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      setCommenting(true);
      await servicesApi.addServiceRequestComment(id, { content: newComment });
      setNewComment('');
      await loadRequest();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleClose = async () => {
    if (!id) return;
    try {
      await servicesApi.closeServiceRequest(id);
      await loadRequest();
      setIsFeedbackOpen(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to close request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <Link to="/services/requests" className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
          <ArrowLeft className="w-4 h-4" /> Back to Helpdesk
        </Link>
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
          {error || 'Request not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/services/requests"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Helpdesk Requests
      </Link>

      {/* Main Request Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} type="status" />
            <StatusBadge status={request.priority} type="priority" />
            <StatusBadge status={request.category} type="category" />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Ticket ID: #{request.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{request.title}</h1>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Location & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Location:{' '}
                <strong className="text-slate-100">
                  {request.locationDetails ||
                    request.room?.name ||
                    request.building?.name ||
                    'General Campus'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Reported by <strong className="text-slate-100">{request.requester.name}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Created {new Date(request.createdAt).toLocaleString()}</span>
            </div>
            {request.assignedTo && (
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Assigned to <strong className="text-slate-100">{request.assignedTo.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action button if resolved or open */}
        {request.status !== 'CLOSED' && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Closed & Satisfied
            </button>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
            >
              <Star className="w-4 h-4" /> Give Feedback
            </button>
          </div>
        )}
      </div>

      {/* Audit History & Comments Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline / Status History */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Service Lifecycle Timeline
          </h3>

          <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {request.history && request.history.length > 0 ? (
              request.history.map((h, i) => (
                <div key={h.id || i} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950"></div>
                  <div className="text-xs font-semibold text-slate-200">
                    {h.newStatus.replace('_', ' ')}
                  </div>
                  {h.comment && <div className="text-xs text-slate-400 mt-0.5">{h.comment}</div>}
                  <div className="text-2xs text-slate-500 mt-1">
                    {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {h.changedBy?.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">No transition history recorded yet.</div>
            )}
          </div>
        </div>

        {/* Operational Updates / Comments */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Operational Updates ({request.comments?.length || 0})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {request.comments && request.comments.length > 0 ? (
                request.comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-200">{c.author.name}</span>
                      <span className="text-2xs">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No comments yet. Technicians and administrators will post progress here.
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add remark or follow up..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={commenting || !newComment.trim()}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        targetType="HELPDESK"
        targetId={request.id}
        targetTitle={request.title}
        onSuccess={() => alert('Thank you for rating our service response!')}
      />
    </div>
  );
};
