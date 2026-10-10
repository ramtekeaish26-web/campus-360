import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, ChevronRight, CheckCircle } from 'lucide-react';
import { LostFoundItem } from '../../types/services.js';
import { StatusBadge } from './StatusBadge.js';

interface LostFoundCardProps {
  item: LostFoundItem;
  onClaim?: (item: LostFoundItem) => void;
}

export const LostFoundCard: React.FC<LostFoundCardProps> = ({ item, onClaim }) => {
  const isLost = item.type === 'LOST';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isLost
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {item.type}
            </span>
            <StatusBadge status={item.status} type="status" />
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(item.itemDate).toLocaleDateString()}</span>
          </div>
        </div>

        <Link to={`/lost-found/${item.id}`} className="group block mb-2">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="space-y-1.5 text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Category: {item.category.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{item.locationText || item.location?.name || 'Campus Grounds'}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <Link
          to={`/lost-found/${item.id}`}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>

        {item.status === 'OPEN' && onClaim && (
          <button
            onClick={() => onClaim(item)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {isLost ? 'Found This Item' : 'Claim Ownership'}
          </button>
        )}
      </div>
    </div>
  );
};
