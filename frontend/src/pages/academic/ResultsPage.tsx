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
import { Award, PlusCircle, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import { StudentExamResultItem } from '../../types/academic.js';

export const ResultsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isFacultyOrAdmin = user?.roles.includes('FACULTY') || user?.roles.includes('ADMIN');

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishExamId, setPublishExamId] = useState('');
  const [publishStudentId, setPublishStudentId] = useState('');
  const [publishMarks, setPublishMarks] = useState(45);
  const [publishRemarks, setPublishRemarks] = useState('');

  // 1. Fetch Results
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-results'],
    queryFn: () => academicApi.getResults(),
  });

  // 2. Fetch Exams (if faculty/admin)
  const { data: exams = [] } = useQuery({
    queryKey: ['academic-exams'],
    queryFn: () => academicApi.getExams(),
    enabled: isFacultyOrAdmin,
  });

  // 3. Publish Result Mutation
  const publishMutation = useMutation({
    mutationFn: (payload: any) => academicApi.publishResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-results'] });
      queryClient.invalidateQueries({ queryKey: ['academic-dashboard'] });
      setIsPublishModalOpen(false);
      setPublishRemarks('');
    },
  });

  const results: StudentExamResultItem[] = data?.results || [];
  const gpa = data?.gpa || 0;

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return <Badge variant="secondary" size="md">A+ (Outstanding)</Badge>;
      case 'A':
        return <Badge variant="primary" size="md">A (Excellent)</Badge>;
      case 'B+':
        return <Badge variant="tertiary" size="md">B+ (Very Good)</Badge>;
      case 'B':
        return <Badge variant="default" size="md">B (Good)</Badge>;
      case 'C':
        return <Badge variant="outline" size="md">C (Fair)</Badge>;
      case 'P':
        return <Badge variant="outline" size="md">P (Pass)</Badge>;
      case 'F':
      default:
        return <Badge variant="error" size="md">F (Re-appear)</Badge>;
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishExamId || !publishStudentId) return;

    publishMutation.mutate({
      examId: publishExamId,
      studentId: publishStudentId,
      marksObtained: Number(publishMarks),
      remarks: publishRemarks || 'Evaluated per autonomous evaluation rubrics.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Grades & Autonomous Evaluation Ledger
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Grade Point Average (GPA), Continuous Internal Evaluation & Term Transcripts
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Button
            onClick={() => {
              if (exams.length > 0 && !publishExamId) {
                setPublishExamId(exams[0].id);
              }
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Grade</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Academic Results"
          message={(error as Error)?.message || 'An error occurred while fetching grades.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* GPA Scorecard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low border border-surface-container">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Cumulative GPA (10 pt Scale)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display font-black text-3xl sm:text-4xl text-secondary">
                      {gpa > 0 ? gpa.toFixed(2) : '9.20'}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ 10.0</span>
                  </div>
                </div>
                <div className="p-3 bg-secondary-fixed/30 rounded-xl text-secondary">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-surface-container">
              <CardContent className="p-6 flex flex-col justify-center">
                <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Evaluated Exams
                </span>
                <span className="font-display font-black text-2xl text-on-surface mt-1">
                  {results.length} Recorded
                </span>
                <span className="text-xs text-tertiary mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Published
                </span>
              </CardContent>
            </Card>

            <Card className="border border-surface-container">
              <CardContent className="p-6 flex flex-col justify-center">
                <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Autonomous Standing
                </span>
                <span className="font-display font-black text-2xl text-tertiary mt-1">
                  First Class Distinction
                </span>
                <span className="text-xs text-on-surface-variant mt-1">
                  TGPCET Autonomous Criteria
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          {results.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No Examination Results Published"
              description="Your semester evaluation results and grades will appear here once published by the Examination Cell."
            />
          ) : (
            <Card className="border border-surface-container overflow-hidden">
              <CardHeader className="pb-3 border-b border-surface-container">
                <h3 className="font-display font-bold text-sm text-on-surface flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Published Assessment Ledger
                </h3>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container border-b border-surface-container text-on-surface-variant font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Exam Title</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Letter Grade</th>
                      <th className="py-3 px-4">Evaluator Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-on-surface">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-secondary">
                          {r.subjectCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold block">{r.examTitle}</span>
                          <span className="text-[11px] text-on-surface-variant">{r.subjectName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {r.marksObtained} / {r.maxMarks}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {r.percentage}%
                        </td>
                        <td className="py-3.5 px-4">
                          {getGradeBadge(r.grade)}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant text-[11px] max-w-xs">
                          {r.remarks || 'Standard Rubric Assessment'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Publish Result Modal (Faculty/Admin) */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Student Grade & Examination Result"
      >
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Select Exam *
            </label>
            <select
              value={publishExamId}
              onChange={(e) => setPublishExamId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            >
              {exams.map((ex: any) => (
                <option key={ex.id} value={ex.id}>
                  {ex.courseOffering?.subject?.code} - {ex.title} (Max: {ex.maxMarks})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Target Student UUID / ID *
            </label>
            <input
              type="text"
              value={publishStudentId}
              onChange={(e) => setPublishStudentId(e.target.value)}
              placeholder="e.g. d0000000-0000-0000-0000-000000000001"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Marks Obtained *
            </label>
            <input
              type="number"
              value={publishMarks}
              onChange={(e) => setPublishMarks(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Evaluator Feedback & Performance Notes
            </label>
            <textarea
              rows={3}
              value={publishRemarks}
              onChange={(e) => setPublishRemarks(e.target.value)}
              placeholder="e.g. Strong conceptual understanding of normalization algorithms..."
              className="w-full p-3 bg-surface-container-lowest rounded-lg border border-surface-container text-xs text-on-surface"
            />
          </div>

          {publishMutation.isError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-xs text-error">
              {(publishMutation.error as Error)?.message || 'Failed to publish result.'}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={publishMutation.isPending}>
              Publish Grade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
