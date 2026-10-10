import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicApi } from '../../services/academicApi.js';
import { Card, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { ClassScheduleItem } from '../../types/academic.js';

const DAYS = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
];

export const SchedulePage: React.FC = () => {
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayName = dayNames[new Date().getDay()];
  const defaultDay = todayName === 'SUNDAY' ? 'MONDAY' : todayName;

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);

  const { data: schedule = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-schedule', selectedDay],
    queryFn: () => academicApi.getSchedule(selectedDay),
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Weekly Timetable & Lecture Schedule
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Section class schedules, lecture halls, and instructor allocations
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl overflow-x-auto max-w-full">
          {DAYS.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDay === d.key
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="hidden sm:inline">{d.label}</span>
              <span className="sm:hidden">{d.short}</span>
              {todayName === d.key && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Content */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Timetable"
          message={(error as Error)?.message || 'An error occurred while loading your schedule.'}
          onRetry={() => refetch()}
        />
      ) : schedule.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No Classes Scheduled on ${selectedDay}`}
          description="Enjoy your open study hours or library research session."
        />
      ) : (
        <div className="space-y-3">
          {schedule.map((item: ClassScheduleItem) => {
            const facultyName = item.courseOffering?.faculty?.profile
              ? `${item.courseOffering.faculty.profile.firstName} ${item.courseOffering.faculty.profile.lastName}`
              : 'Assigned Faculty';

            return (
              <Card
                key={item.id}
                className="hover:border-secondary/40 transition-all border border-surface-container overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 gap-4">
                  {/* Left Column: Time & Course */}
                  <div className="flex items-start gap-4">
                    {/* Time Slot Box */}
                    <div className="flex flex-col items-center justify-center p-3 bg-primary-container text-on-primary rounded-xl min-w-[100px] text-center shrink-0">
                      <Clock className="w-4 h-4 text-secondary mb-1" />
                      <span className="font-mono text-xs font-bold leading-none">
                        {item.startTime}
                      </span>
                      <span className="text-[10px] text-on-primary/70 mt-0.5">to</span>
                      <span className="font-mono text-xs font-bold leading-none">
                        {item.endTime}
                      </span>
                    </div>

                    {/* Course Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                          {item.courseOffering?.subject?.code}
                        </span>
                        <Badge variant="outline" size="sm">
                          Section {item.courseOffering?.sectionName || 'A'}
                        </Badge>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-on-surface mt-1">
                        {item.courseOffering?.subject?.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>{facultyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-semibold text-on-surface">{item.room}</span>
                          <span className="text-on-surface-variant">({item.building})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status / Next indicator */}
                  <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-tertiary shrink-0">
                    <span>Autonomous Coursework</span>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
