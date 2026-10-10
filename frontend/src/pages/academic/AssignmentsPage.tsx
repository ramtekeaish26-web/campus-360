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
  FileText,
  Clock,
  CheckCircle,
  PlusCircle,
  Upload,
  Calendar,
  Award,
  Send,
} from 'lucide-react';
import { AssignmentItem } from '../../types/academic.js';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isStudent = user?.roles.includes('STUDENT');
  const isFacultyOrAdmin = user?.roles.includes('FACULTY') || user?.roles.includes('ADMIN');

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SUBMITTED'>('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  // Faculty Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOfferingId, setCreateOfferingId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');
  const [createMaxMarks, setCreateMaxMarks] = useState(50);

  // 1. Fetch Assignments
  const { data: assignments = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-assignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  // 2. Fetch Offerings (if faculty/admin)
  const { data: offerings = [] } = useQuery({
    queryKey: ['academic-offerings-faculty'],
    queryFn: () => academicApi.getOfferings(),
    enabled: isFacultyOrAdmin,
  });

  // 3. Submit Assignment Mutation
  const submitMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      academicApi.submitAssignment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsSubmitModalOpen(false);
      setSubmissionText('');
      setSelectedAssignment(null);
    },
  });

  // 4. Create Assignment Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateDueDate('');
    },
  });

  const filteredAssignments = assignments.filter((item: AssignmentItem) => {
    if (!isStudent || activeTab === 'ALL') return true;
    const hasSubmitted = item.submissions && item.submissions.length > 0;
    if (activeTab === 'PENDING') return !hasSubmitted;
    if (activeTab === 'SUBMITTED') return hasSubmitted;
    return true;
  });

  const handleOpenSubmit = (assignment: AssignmentItem) => {
    setSelectedAssignment(assignment);
    const existing = assignment.submissions?.[0]?.content || '';
    setSubmissionText(existing);
    setIsSubmitModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createOfferingId) return;

    createMutation.mutate({
      courseOfferingId: createOfferingId,
      title: createTitle,
      description: createDescription,
      dueDate: new Date(createDueDate).toISOString(),
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
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Continuous Assessment & Course Assignments
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Autonomous Internal Evaluation, Deliverable Submissions & Grading Ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isStudent && (
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl">
              {(['ALL', 'PENDING', 'SUBMITTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab === 'ALL' ? 'All Tasks' : tab === 'PENDING' ? 'Pending' : 'Submitted'}
                </button>
              ))}
            </div>
          )}

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
              <span>Create Assignment</span>
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
          title="Failed to Load Assignments"
          message={(error as Error)?.message || 'An error occurred while fetching assignments.'}
          onRetry={() => refetch()}
        />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Assignments Found"
          description="All assigned tasks are clear or no submissions match your filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((assignment: AssignmentItem) => {
            const submission = assignment.submissions?.[0];
            const isSubmitted = !!submission;
            const isGraded = submission?.status === 'GRADED';
            const dueDateObj = new Date(assignment.dueDate);
            const isOverdue = !isSubmitted && dueDateObj < new Date();

            return (
              <Card key={assignment.id} className="border border-surface-container hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-surface-container flex flex-row items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                        {assignment.courseOffering?.subject?.code}
                      </span>
                      <span className="text-xs font-medium text-on-surface-variant truncate">
                        {assignment.courseOffering?.subject?.name}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-on-surface mt-1.5 leading-snug">
                      {assignment.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-xs font-bold text-tertiary">
                      {assignment.maxMarks} Marks
                    </span>
                    {isStudent && (
                      <Badge variant={isGraded ? 'success' : isSubmitted ? 'primary' : isOverdue ? 'error' : 'default'} size="sm">
                        {isGraded ? `Graded: ${submission.marks}/${assignment.maxMarks}` : isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                      </Badge>
                    )}
                    {isFacultyOrAdmin && (
                      <Badge variant="outline" size="sm">
                        {assignment._count?.submissions || 0} Submissions
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-3 space-y-4">
                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {assignment.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-surface-container">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>Due: {dueDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {isStudent && (
                      <Button
                        size="sm"
                        variant={isSubmitted ? 'outline' : 'primary'}
                        onClick={() => handleOpenSubmit(assignment)}
                        className="text-xs"
                      >
                        {isSubmitted ? 'Edit Response' : 'Submit Response'}
                      </Button>
                    )}
                  </div>

                  {/* Feedback preview if graded */}
                  {submission?.feedback && (
                    <div className="p-2.5 bg-tertiary-container/10 border border-tertiary/20 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-tertiary flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Instructor Evaluation:
                      </span>
                      <p className="text-on-surface text-[11px]">{submission.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Student Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Response: ${selectedAssignment?.title || ''}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-surface-container rounded-lg text-xs text-on-surface-variant space-y-1">
            <span className="font-bold text-on-surface block">Assignment Deliverable Prompt:</span>
            <p>{selectedAssignment?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Your Written Response / Solution Report *
            </label>
            <textarea
              rows={6}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your technical solution, benchmark results, pseudocode, or analytical summary here..."
              className="w-full p-3 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
              required
            />
          </div>

          {submitMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(submitMutation.error as Error)?.message || 'Failed to submit response.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedAssignment || !submissionText.trim()) return;
                submitMutation.mutate({ id: selectedAssignment.id, content: submissionText });
              }}
              isLoading={submitMutation.isPending}
              disabled={!submissionText.trim()}
              className="flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Deliverable</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Faculty Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Coursework Assignment"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Target Course Offering *
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
              Assignment Title *
            </label>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming & Shortest Path Benchmark"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Detailed Description & Problem Statement *
            </label>
            <textarea
              rows={4}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Specify requirements, constraints, deliverable expectations..."
              className="w-full p-3 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                value={createDueDate}
                onChange={(e) => setCreateDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                value={createMaxMarks}
                onChange={(e) => setCreateMaxMarks(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
                required
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(createMutation.error as Error)?.message || 'Failed to create assignment.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
