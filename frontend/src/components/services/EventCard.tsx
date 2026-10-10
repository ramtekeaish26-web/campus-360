import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { CampusEvent } from '../../types/services.js';
import { StatusBadge } from './StatusBadge.js';

interface EventCardProps {
  event: CampusEvent;
  onRegister?: (id: string) => void;
  onCancelRegistration?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister, onCancelRegistration }) => {
  const startDate = new Date(event.startDateTime);
  const formattedDate = startDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <StatusBadge status={event.category} type="category" />
          <div className="text-right">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {formattedDate}
            </span>
          </div>
        </div>

        <Link to={`/events/${event.id}`} className="group block mb-2">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2 text-xs text-slate-400 mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{event.venue || event.location?.name || 'TGPCET Campus'}</span>
          </div>
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {event.registeredCount} / {event.capacity} Registered
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <Link
          to={`/events/${event.id}`}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </Link>

        {event.registrationRequired && (
          <div>
            {event.isRegistered ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Registered
                </span>
                {onCancelRegistration && (
                  <button
                    onClick={() => onCancelRegistration(event.id)}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onRegister && onRegister(event.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Register Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
