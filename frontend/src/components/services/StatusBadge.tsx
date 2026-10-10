import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'category' | 'audience';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  const getBadgeStyle = () => {
    const s = status.toUpperCase();

    // Priority
    if (s === 'URGENT' || s === 'HIGH') {
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
    if (s === 'IMPORTANT' || s === 'MEDIUM') {
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
    if (s === 'NORMAL' || s === 'LOW') {
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }

    // Status
    if (s === 'RESOLVED' || s === 'COMPLETED' || s === 'APPROVED' || s === 'REGISTERED' || s === 'ACTIVE') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s === 'IN_PROGRESS' || s === 'ASSIGNED' || s === 'PENDING') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (s === 'OPEN' || s === 'PUBLISHED') {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
    if (s === 'CLOSED' || s === 'ARCHIVED' || s === 'CANCELLED' || s === 'REJECTED' || s === 'LEFT') {
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
    if (s === 'CLAIMED') {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }

    // Categories
    if (s === 'ACADEMIC' || s === 'EXAM') {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
    if (s === 'TECHNICAL' || s === 'PROJECTOR' || s === 'WIFI') {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
    if (s === 'ELECTRICAL' || s === 'WATER' || s === 'INFRASTRUCTURE') {
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    }
    if (s === 'CULTURAL' || s === 'SPORTS') {
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    }
    if (s === 'EMERGENCY') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }

    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
