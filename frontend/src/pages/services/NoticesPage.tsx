import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { Notice, NoticeCategory, NoticePriority } from '../../types/services.js';
import { NoticeCard } from '../../components/services/NoticeCard.js';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesApi.getNotices({
        category: category !== 'ALL' ? category : undefined,
        priority: priority !== 'ALL' ? priority : undefined,
        search: search.trim() || undefined,
      });
      setNotices(res.notices || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load campus notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [category, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNotices();
  };

  const categories = ['ALL', 'ACADEMIC', 'EXAM', 'ADMINISTRATIVE', 'DEPARTMENT', 'GENERAL', 'EMERGENCY'];
  const priorities = ['ALL', 'NORMAL', 'IMPORTANT', 'URGENT'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notices & Circulars
          </h1>
          <p className="text-sm text-slate-400">
            Official announcements, academic circulars, exam schedules, and department notices
          </p>
        </div>

        <button
          onClick={loadNotices}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars, examination keywords, guidelines..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                category === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-xl p-8">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">No notices available</h3>
          <p className="text-xs text-slate-500">
            There are no notices matching your current search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};
