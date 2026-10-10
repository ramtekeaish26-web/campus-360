import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle, Navigation } from 'lucide-react';
import { servicesApi } from '../../services/servicesApi.js';
import { CampusEvent } from '../../types/services.js';
import { StatusBadge } from '../../components/services/StatusBadge.js';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await servicesApi.getEventById(id);
      setEvent(res.event);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await servicesApi.registerForEvent(id);
      await loadEvent();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await servicesApi.cancelEventRegistration(id);
      await loadEvent();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link to="/events" className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <StatusBadge status={event.category} type="category" />
          <div className="text-xs text-indigo-400 font-medium">
            Organized by {event.organizer.name}
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">{event.title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{event.venue || event.location?.name || 'Main Campus'}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {event.description}
        </div>

        {event.location && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300">
                Venue Location: <strong className="text-slate-100">{event.location.name}</strong>
              </span>
            </div>
            <Link
              to={`/campus/locations/${event.location.slug}`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
            >
              View on Map
            </Link>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-4 h-4 text-slate-500" />
              <span>
                {event.registeredCount} / {event.capacity || 'Unlimited'} seats registered
              </span>
            </div>
          </div>

          {event.registrationRequired && (
            <div>
              {event.isRegistered ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" /> You are registered
                  </span>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={actionLoading || (event.capacity ? event.registeredCount >= event.capacity : false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Register for Event'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
