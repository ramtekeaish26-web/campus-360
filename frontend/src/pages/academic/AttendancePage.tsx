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
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { SubjectAttendanceBreakdown } from '../../types/academic.js';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isFacultyOrAdmin = user?.roles.includes('FACULTY') || user?.roles.includes('ADMIN');

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionStartTime, setSessionStartTime] = useState('09:00');
  const [sessionEndTime, setSessionEndTime] = useState('10:00');
  const [sessionTopic, setSessionTopic] = useState('');

  // 1. Fetch Student/General Attendance Summary
  const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-attendance'],
    queryFn: () => academicApi.getAttendance(),
  });

  // 2. Fetch Faculty Offerings (if faculty/admin)
  const { data: offerings = [] } = useQuery({
    queryKey: ['academic-offerings-faculty'],
    queryFn: () => academicApi.getOfferings(),
    enabled: isFacultyOrAdmin,
  });

  // 3. Record Attendance Mutation
  const recordMutation = useMutation({
    mutationFn: (payload: any) => academicApi.recordAttendanceSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsRecordModalOpen(false);
      setSessionTopic('');
    },
  });

  const overall = attendanceData?.overall || {
    totalSessions: 0,
    presentSessions: 0,
    lateSessions: 0,
    absentSessions: 0,
    excusedSessions: 0,
    percentage: 100,
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 75) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container/30 text-tertiary border border-tertiary/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Normal Eligibility ({pct}%)
        </span>
      );
    } else if (pct >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" /> Warning Threshold ({pct}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-error-container/30 text-error border border-error/20">
          <XCircle className="w-3.5 h-3.5" /> Critical Detention Risk ({pct}%)
        </span>
      );
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferingId) return;

    recordMutation.mutate({
      courseOfferingId: selectedOfferingId,
      date: new Date(sessionDate).toISOString(),
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      topic: sessionTopic || 'Class Lecture',
      records: [
        { studentId: user?.id || 'd0000000-0000-0000-0000-000000000001', status: 'PRESENT' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Attendance & Regulatory Compliance
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Autonomous 75% Minimum Criterion Monitoring & Session-Wise Breakdown
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Button
            onClick={() => {
              if (offerings.length > 0 && !selectedOfferingId) {
                setSelectedOfferingId(offerings[0].id);
              }
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Attendance Records"
          message={(error as Error)?.message || 'An error occurred while calculating attendance.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Overall Attendance Metric Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-2 bg-gradient-to-br from-surface-container-lowest to-surface-container-low border border-surface-container">
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Institutional Aggregate
                    </span>
                    <h3 className="font-display font-black text-3xl sm:text-4xl text-on-surface mt-1">
                      {overall.percentage}%
                    </h3>
                  </div>
                  {getStatusBadge(overall.percentage)}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        overall.percentage >= 75
                          ? 'bg-tertiary'
                          : overall.percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-error'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, overall.percentage))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
                    <span>0%</span>
                    <span className="font-bold text-secondary">75% Req.</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-surface-container">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Present Sessions
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-tertiary">
                    {overall.presentSessions}
                  </span>
                  <span className="text-xs text-on-surface-variant">/ {overall.totalSessions} Total</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-tertiary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Present</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-surface-container">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Late & Excused
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display font-black text-2xl text-amber-600">
                    {overall.lateSessions + overall.excusedSessions}
                  </span>
                  <span className="text-xs text-on-surface-variant">sessions</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Late (0.5x) / Excused (1.0x)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject-Wise Attendance Breakdown */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold font-display text-on-surface flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Subject-Wise Attendance Ledger
            </h2>

            {(!attendanceData?.subjectBreakdown || attendanceData.subjectBreakdown.length === 0) ? (
              <EmptyState
                icon={UserCheck}
                title="No Enrolled Attendance Found"
                description="Your active course offerings and logged sessions will display here."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendanceData.subjectBreakdown.map((item: SubjectAttendanceBreakdown) => (
                  <Card key={item.offeringId} className="border border-surface-container hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-3 border-b border-surface-container flex flex-row items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                            {item.subjectCode}
                          </span>
                          <span className="text-xs font-bold text-on-surface truncate">
                            {item.facultyName}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-on-surface mt-1">
                          {item.subjectName}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono text-lg font-black ${
                          item.percentage >= 75
                            ? 'text-tertiary'
                            : item.percentage >= 60
                            ? 'text-amber-600'
                            : 'text-error'
                        }`}>
                          {item.percentage}%
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 space-y-3">
                      <div className="flex justify-between text-xs text-on-surface-variant font-mono">
                        <span>Attended: {item.presentSessions + item.lateSessions} / {item.totalSessions}</span>
                        <span>Absent: {item.absentSessions}</span>
                      </div>

                      {/* Recent Session Pills */}
                      {item.recentRecords && item.recentRecords.length > 0 && (
                        <div className="pt-2 border-t border-surface-container space-y-1">
                          <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">
                            Recent Logs:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.recentRecords.map((rec) => (
                              <span
                                key={rec.id}
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                  rec.status === 'PRESENT'
                                    ? 'bg-tertiary-container/30 text-tertiary'
                                    : rec.status === 'LATE'
                                    ? 'bg-amber-500/20 text-amber-700'
                                    : rec.status === 'EXCUSED'
                                    ? 'bg-primary-container/20 text-primary'
                                    : 'bg-error-container/30 text-error'
                                }`}
                              >
                                {rec.status} ({new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Record Attendance Modal (Faculty/Admin) */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Lecture Attendance Session"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Course Offering *
            </label>
            <select
              value={selectedOfferingId}
              onChange={(e) => setSelectedOfferingId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            >
              {offerings.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.subject?.code} - {o.subject?.name} (Sec {o.sectionName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Date *
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Start *
              </label>
              <input
                type="text"
                value={sessionStartTime}
                onChange={(e) => setSessionStartTime(e.target.value)}
                placeholder="09:00"
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                End *
              </label>
              <input
                type="text"
                value={sessionEndTime}
                onChange={(e) => setSessionEndTime(e.target.value)}
                placeholder="10:00"
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Lecture Topic / Coverage
            </label>
            <input
              type="text"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="e.g. Distributed Consensus & Raft Protocol"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
            />
          </div>

          {recordMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(recordMutation.error as Error)?.message || 'Failed to record attendance session.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={recordMutation.isPending}>
              Submit Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
