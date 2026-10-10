import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bell, ArrowLeft, Calendar, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { Notice } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';

export const NoticeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const res = await servicesApi.getNoticeById(id);
        setNotice(res.notice);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Notice not found');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="space-y-4">
        <Link to="/notices" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> Back to Notices
        </Link>
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
          {error || 'Notice not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/notices"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={notice.priority} type="priority" />
            <StatusBadge status={notice.category} type="category" />
            {notice.department && (
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {notice.department.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Published on {new Date(notice.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3 leading-snug">
            {notice.title}
          </h1>
          {notice.summary && (
            <p className="text-sm font-medium text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {notice.summary}
            </p>
          )}
        </div>

        <div className="prose prose-invert max-w-none text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
          {notice.content}
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>
              Authorized by <strong className="text-slate-200">{notice.author.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Institutional Notice</span>
          </div>
        </div>
      </div>
    </div>
  );
};
