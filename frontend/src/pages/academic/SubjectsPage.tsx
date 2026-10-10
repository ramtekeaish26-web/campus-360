import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicApi } from '../../services/academicApi.js';
import { Card, CardHeader, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import { BookOpen, Award, Layers, Search, Filter } from 'lucide-react';
import { Subject } from '../../types/academic.js';

export const SubjectsPage: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: subjects = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academic-subjects', selectedSemester],
    queryFn: () =>
      academicApi.getSubjects(
        selectedSemester !== 'ALL' ? { semester: selectedSemester } : undefined
      ),
  });

  const filteredSubjects = subjects.filter(
    (s: Subject) =>
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-display text-on-surface">
              Curriculum & Course Catalog
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Autonomous Institutional Syllabus, Course Offerings & Credit Allocations
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-on-surface-variant font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Semester:
          </span>
          {['ALL', 1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSemester === sem
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {sem === 'ALL' ? 'All' : `Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects by course code, title, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl border border-surface-container text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
        />
      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Course Catalog"
          message={(error as Error)?.message || 'An error occurred while fetching curriculum subjects.'}
          onRetry={() => refetch()}
        />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Found"
          description={
            searchQuery
              ? `No courses matched your query "${searchQuery}".`
              : 'No curriculum courses are registered for the selected semester.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub: Subject) => (
            <Card key={sub.id} className="hover:shadow-md transition-shadow border border-surface-container">
              <CardHeader className="pb-3 border-b border-surface-container flex flex-row items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {sub.status}
                    </Badge>
                  </div>
                  <h3 className="font-display font-bold text-sm text-on-surface mt-1.5 leading-snug">
                    {sub.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-[11px] font-bold text-tertiary shrink-0">
                  <Award className="w-3.5 h-3.5" />
                  <span>{sub.credits} Credits</span>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                  {sub.description || 'Comprehensive autonomous curriculum syllabus designed for engineering proficiency.'}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-on-surface-variant border-t border-surface-container">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-secondary" />
                    <span>Semester {sub.semester}</span>
                  </div>
                  <span className="font-medium text-on-surface truncate max-w-[150px]">
                    {sub.department?.name || 'Engineering'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
