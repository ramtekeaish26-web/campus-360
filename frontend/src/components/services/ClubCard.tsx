import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, Plus, ChevronRight } from 'lucide-react';
import { Club } from '../../types/services.js';
import { StatusBadge } from './StatusBadge.js';

interface ClubCardProps {
  club: Club;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onJoin, onLeave }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <StatusBadge status={club.category} type="category" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{club.memberCount} Members</span>
          </div>
        </div>

        <Link to={`/clubs/${club.slug}`} className="group block mb-2">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {club.name}
          </h3>
        </Link>

        <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {club.description}
        </p>

        {club.department && (
          <div className="mb-4">
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Affiliated: {club.department.name}
            </span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <Link
          to={`/clubs/${club.slug}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
        >
          View Community <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {club.isMember ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> {club.userRole || 'Member'}
            </span>
            {onLeave && (
              <button
                onClick={() => onLeave(club.id)}
                className="text-xs text-slate-500 hover:text-red-400"
                title="Leave club"
              >
                Leave
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onJoin && onJoin(club.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Join Club
          </button>
        )}
      </div>
    </div>
  );
};
