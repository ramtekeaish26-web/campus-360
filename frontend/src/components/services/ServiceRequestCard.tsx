import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { ServiceRequest } from '../../types/services.js';
import { StatusBadge } from './StatusBadge.js';

interface ServiceRequestCardProps {
  request: ServiceRequest;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({ request }) => {
  const createdDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} type="status" />
          <StatusBadge status={request.priority} type="priority" />
          <StatusBadge status={request.category} type="category" />
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{createdDate}</span>
        </div>
      </div>

      <Link to={`/services/requests/${request.id}`} className="group block mb-2">
        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {request.title}
        </h3>
      </Link>

      <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
        {request.description}
      </p>

      <div className="space-y-1.5 text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">
            {request.locationDetails ||
              request.room?.name ||
              request.building?.name ||
              request.place?.name ||
              'Campus Location'}
          </span>
        </div>
        {request.assignedTo && (
          <div className="text-slate-400">
            Assigned: <span className="text-slate-300 font-medium">{request.assignedTo.name}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>{request.commentCount || 0} updates</span>
        </div>

        <Link
          to={`/services/requests/${request.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
        >
          Track Request <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
