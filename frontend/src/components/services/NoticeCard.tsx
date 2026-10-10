import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, User, ChevronRight } from 'lucide-react';
import { Notice } from '../../types/services.js';
import { StatusBadge } from './StatusBadge.js';

interface NoticeCardProps {
  notice: Notice;
  onMarkRead?: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onMarkRead }) => {
  const isUrgent = notice.priority === 'URGENT';
  const isImportant = notice.priority === 'IMPORTANT';

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 p-5 ${
        isUrgent
          ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
          : isImportant
          ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/50'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      } ${!notice.isRead ? 'shadow-sm ring-1 ring-indigo-500/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={notice.priority} type="priority" />
          <StatusBadge status={notice.category} type="category" />
          {notice.department && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {notice.department.code}
            </span>
          )}
          {!notice.isRead && (
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <Link to={`/notices/${notice.id}`} className="group block mb-2">
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {notice.title}
        </h3>
      </Link>

      <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
        {notice.summary || notice.content}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{notice.author.name}</span>
        </div>

        <Link
          to={`/notices/${notice.id}`}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
          onClick={() => onMarkRead && onMarkRead(notice.id)}
        >
          Read Full Notice
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
