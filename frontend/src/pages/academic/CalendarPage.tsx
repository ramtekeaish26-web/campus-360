import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApi } from '../../services/academicApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { Card, CardHeader, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import {
  CalendarDays,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Clock,
  Filter,
} from 'lucide-react';
import { AcademicCalendarEventItem } from '../../types/academic.js';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles.includes('ADMIN');

  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'DEADLINE' | 'OTHER'>('ACADEMIC');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventVisibility, setEventVisibility] = useState<'ALL' | 'STUDENT' | 'FACULTY'>('ALL');

  // 1. Fetch Calendar Events
  const { data: events = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-calendar', selectedEventType],
    queryFn: () =>
      academicApi.getCalendar(
        selectedEventType !== 'ALL' ? { eventType: selectedEventType } : undefined
      ),
  });

  // 2. Add Event Mutation
  const addMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createCalendarEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsAddModalOpen(false);
      setEventTitle('');
      setEventDesc('');
      setEventStartDate('');
      setEventEndDate('');
    },
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'EXAM':
        return <Badge variant="secondary" size="sm">Examination</Badge>;
      case 'HOLIDAY':
        return <Badge variant="tertiary" size="sm">Holiday Break</Badge>;
      case 'DEADLINE':
        return <Badge variant="error" size="sm">Deliverable Deadline</Badge>;
      case 'ACADEMIC':
      default:
        return <Badge variant="primary" size="sm">Academic Schedule</Badge>;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      title: eventTitle,
      description: eventDesc || undefined,
      eventType,
      startDate: new Date(eventStartDate).toISOString(),
      endDate: new Date(eventEndDate).toISOString(),
      visibility: eventVisibility,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Institutional Academic Calendar
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Autonomous Terms, Examination Windows, Institutional Breaks & Key Deadlines
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl">
            {['ALL', 'ACADEMIC', 'EXAM', 'HOLIDAY', 'DEADLINE'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedEventType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedEventType === type
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {type === 'ALL' ? 'All Events' : type}
              </button>
            ))}
          </div>

          {isAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 text-xs ml-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Event</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Academic Calendar"
          message={(error as Error)?.message || 'An error occurred while fetching calendar events.'}
          onRetry={() => refetch()}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Calendar Events Found"
          description="No institutional calendar events match the selected category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event: AcademicCalendarEventItem) => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            return (
              <Card
                key={event.id}
                className="border border-surface-container hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 border-b border-surface-container flex flex-row items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.eventType)}
                      <Badge variant="outline" size="sm">
                        {event.visibility === 'ALL' ? 'Campus-Wide' : `${event.visibility} Only`}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-on-surface pt-1">
                      {event.title}
                    </h3>
                  </div>

                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center p-2.5 bg-primary-container text-on-primary rounded-xl min-w-[70px] text-center shrink-0">
                    <span className="font-mono text-[10px] font-bold text-secondary uppercase">
                      {startDate.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="font-display font-black text-lg leading-none mt-0.5">
                      {startDate.getDate()}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-3 space-y-3">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {event.description || 'Institutional autonomous calendar event for academic session.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>
                        {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {startDate.toDateString() !== endDate.toDateString() &&
                          ` – ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admin Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Institutional Calendar Event"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Mid-Semester Examinations Window"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Event Category *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              >
                <option value="ACADEMIC">Academic Instruction</option>
                <option value="EXAM">Examination Period</option>
                <option value="HOLIDAY">Holiday Break</option>
                <option value="DEADLINE">Submission Deadline</option>
                <option value="OTHER">Other Institutional Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Visibility Audience
              </label>
              <select
                value={eventVisibility}
                onChange={(e) => setEventVisibility(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              >
                <option value="ALL">Entire Campus (All)</option>
                <option value="STUDENT">Students Only</option>
                <option value="FACULTY">Faculty & Staff Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Description & Details
            </label>
            <textarea
              rows={3}
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              placeholder="Provide context, instructions, or institutional circular details..."
              className="w-full p-3 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
            />
          </div>

          {addMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(addMutation.error as Error)?.message || 'Failed to add calendar event.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addMutation.isPending}>
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
