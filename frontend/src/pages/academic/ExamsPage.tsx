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
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Award,
  AlertCircle,
} from 'lucide-react';
import { ExamItem } from '../../types/academic.js';

export const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isFacultyOrAdmin = user?.roles.includes('FACULTY') || user?.roles.includes('ADMIN');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOfferingId, setCreateOfferingId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createType, setCreateType] = useState<'MIDTERM' | 'END_SEMESTER' | 'PRACTICAL' | 'QUIZ'>('MIDTERM');
  const [createDate, setCreateDate] = useState('');
  const [createStartTime, setCreateStartTime] = useState('09:30');
  const [createEndTime, setCreateEndTime] = useState('11:30');
  const [createRoom, setCreateRoom] = useState('Examination Hall 1 (Block A)');
  const [createMaxMarks, setCreateMaxMarks] = useState(50);

  // 1. Fetch Exams
  const { data: exams = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-exams'],
    queryFn: () => academicApi.getExams(),
  });

  // 2. Fetch Offerings (if faculty/admin)
  const { data: offerings = [] } = useQuery({
    queryKey: ['academic-offerings-faculty'],
    queryFn: () => academicApi.getOfferings(),
    enabled: isFacultyOrAdmin,
  });

  // 3. Create Exam Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-exams'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsCreateModalOpen(false);
      setCreateTitle('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createOfferingId) return;

    createMutation.mutate({
      courseOfferingId: createOfferingId,
      title: createTitle,
      examType: createType,
      date: new Date(createDate).toISOString(),
      startTime: createStartTime,
      endTime: createEndTime,
      room: createRoom,
      maxMarks: Number(createMaxMarks),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Autonomous Examination Schedule
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Midterm Evaluations, End-Semester Theory & Practical Lab Assessments
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Button
            onClick={() => {
              if (offerings.length > 0 && !createOfferingId) {
                setCreateOfferingId(offerings[0].id);
              }
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Exam</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Examinations"
          message={(error as Error)?.message || 'An error occurred while loading exam schedules.'}
          onRetry={() => refetch()}
        />
      ) : exams.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Scheduled Examinations"
          description="No formal exam sessions are registered for your active courses."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam: ExamItem) => {
            const examDateObj = new Date(exam.date);
            const isCompleted = exam.status === 'COMPLETED' || examDateObj < new Date();

            return (
              <Card
                key={exam.id}
                className="border border-surface-container hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 border-b border-surface-container flex flex-row items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                        {exam.courseOffering?.subject?.code}
                      </span>
                      <Badge
                        variant={
                          exam.examType === 'MIDTERM'
                            ? 'primary'
                            : exam.examType === 'END_SEMESTER'
                            ? 'secondary'
                            : 'tertiary'
                        }
                        size="sm"
                      >
                        {exam.examType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-sm text-on-surface mt-1.5 leading-snug">
                      {exam.title}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-bold text-tertiary shrink-0">
                    {exam.maxMarks} Marks
                  </span>
                </CardHeader>

                <CardContent className="pt-3 space-y-3">
                  <div className="space-y-2 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-on-surface">
                        {examDateObj.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span className="font-mono">
                        {exam.startTime} – {exam.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-tertiary" />
                      <span className="font-medium text-on-surface">{exam.room}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-container flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono">
                      {exam.courseOffering?.subject?.name}
                    </span>
                    <Badge variant={isCompleted ? 'default' : 'success'} size="sm">
                      {isCompleted ? 'Concluded' : 'Hall Ticket Ready'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Faculty Schedule Exam Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Institutional Examination"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Course Offering *
            </label>
            <select
              value={createOfferingId}
              onChange={(e) => setCreateOfferingId(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Exam Title *
            </label>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Mid-Semester Theory Assessment — Fall 2025"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Exam Type *
              </label>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              >
                <option value="MIDTERM">Midterm Exam</option>
                <option value="END_SEMESTER">End-Semester Exam</option>
                <option value="PRACTICAL">Practical Assessment</option>
                <option value="QUIZ">Continuous Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                value={createMaxMarks}
                onChange={(e) => setCreateMaxMarks(Number(e.target.value))}
                min={10}
                max={100}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Date *
              </label>
              <input
                type="date"
                value={createDate}
                onChange={(e) => setCreateDate(e.target.value)}
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
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
                placeholder="09:30"
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
                value={createEndTime}
                onChange={(e) => setCreateEndTime(e.target.value)}
                placeholder="11:30"
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Examination Hall / Room *
            </label>
            <input
              type="text"
              value={createRoom}
              onChange={(e) => setCreateRoom(e.target.value)}
              placeholder="Examination Hall 1 (Block A)"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              required
            />
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(createMutation.error as Error)?.message || 'Failed to schedule exam.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
