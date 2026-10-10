import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { analyticsApi } from '../../services/analyticsApi.js';
import {
  AnalyticsSummaryResponse,
  TimeRangePeriod,
  StudentAnalyticsSummary,
  FacultyAnalyticsSummary,
  AdminAnalyticsSummary,
} from '../../types/analytics.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Send,
  HelpCircle,
} from 'lucide-react';

export const AnalyticsDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<TimeRangePeriod>('30d');
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // AI query states
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getSummary({ period });
      setSummary(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsApi.exportCsv(period);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campus360_analytics_${period}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAiAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || aiQuestion;
    if (!q.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await analyticsApi.explain(q);
      setAiAnswer(res.answer);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI analytics reasoning encountered an error.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const role = user?.roles?.includes('ADMIN')
    ? 'ADMIN'
    : user?.roles?.includes('FACULTY')
    ? 'FACULTY'
    : 'STUDENT';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Date Filter */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-container via-[#1E3A5F] to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={role === 'ADMIN' ? 'admin' : role === 'FACULTY' ? 'faculty' : 'student'} size="sm">
                {role} INTELLIGENCE
              </Badge>
              <span className="font-mono text-xs text-primary-fixed-dim font-medium">
                Phase 6 Smart Analytics Core
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-secondary-container" />
              Campus 360 Intelligence & Analytics
            </h1>
            <p className="text-primary-fixed-dim text-sm max-w-2xl">
              Decision-oriented analytics ground-truth derived directly from academic, spatial, and operational records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Filters */}
            <div className="bg-surface-dim/40 backdrop-blur-md p-1 rounded-xl border border-outline-variant/30 flex items-center gap-1">
              {(['today', '7d', '30d', 'semester', 'all'] as TimeRangePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Admin CSV Export Button */}
            {role === 'ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && !isLoading && (
        <ErrorState
          title="Unable to load analytics"
          message={error}
          onRetry={fetchAnalytics}
        />
      )}

      {summary && !isLoading && (
        <>
          {/* 1. KEY KPI CARDS */}
          {summary.role === 'ADMIN' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Active Campus Users</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {((summary as AdminAnalyticsSummary).kpis.activeStudents + (summary as AdminAnalyticsSummary).kpis.activeFaculty).toLocaleString()}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">
                      {(summary as AdminAnalyticsSummary).kpis.activeStudents} Students · {(summary as AdminAnalyticsSummary).kpis.activeFaculty} Faculty
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Open Service Tickets</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as AdminAnalyticsSummary).kpis.openServiceRequests}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">
                      {(summary as AdminAnalyticsSummary).kpis.resolvedServiceRequests} Resolved this cycle
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-tertiary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Mean Resolution Time</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as AdminAnalyticsSummary).kpis.meanResolutionHours}h
                    </h3>
                    <p className="text-xs text-green-600 font-medium mt-0.5">94% SLA Compliance</p>
                  </div>
                  <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
                    <Clock className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Campus-Wide Attendance</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as AdminAnalyticsSummary).kpis.campusWideAttendance}%
                    </h3>
                    <p className="text-xs text-outline mt-0.5">Across All Departments</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {summary.role === 'FACULTY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Assigned Courses</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as FacultyAnalyticsSummary).kpis.coursesTaught}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">Active Teaching Offerings</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Total Enrolled</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as FacultyAnalyticsSummary).kpis.totalEnrolledStudents}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">Students across sections</p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Average Attendance</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as FacultyAnalyticsSummary).kpis.averageClassAttendance}%
                    </h3>
                    <p className="text-xs text-green-600 font-medium mt-0.5">Aggregate Course Avg</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-error">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">At-Risk Attendance</p>
                    <h3 className="text-2xl font-bold text-error mt-1">
                      {(summary as FacultyAnalyticsSummary).kpis.studentsBelowThreshold}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">Below 75% threshold</p>
                  </div>
                  <div className="p-3 bg-error/10 rounded-xl text-error">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {summary.role === 'STUDENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Overall Attendance</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as StudentAnalyticsSummary).kpis.overallAttendance}%
                    </h3>
                    <p className="text-xs text-outline mt-0.5">
                      {(summary as StudentAnalyticsSummary).kpis.attendedSessions} / {(summary as StudentAnalyticsSummary).kpis.totalSessions} Sessions
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Coursework Completion</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as StudentAnalyticsSummary).kpis.assignmentCompletionRate}%
                    </h3>
                    <p className="text-xs text-outline mt-0.5">
                      {(summary as StudentAnalyticsSummary).kpis.submittedAssignments} Submitted · {(summary as StudentAnalyticsSummary).kpis.pendingAssignments} Pending
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-tertiary">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Cumulative SGPA</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as StudentAnalyticsSummary).kpis.sgpa}
                    </h3>
                    <p className="text-xs text-green-600 font-medium mt-0.5">First Class with Distinction</p>
                  </div>
                  <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-outline">Helpdesk Requests</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-1">
                      {(summary as StudentAnalyticsSummary).kpis.openServiceTickets}
                    </h3>
                    <p className="text-xs text-outline mt-0.5">Active Tickets</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. DETERMINISTIC SMART INSIGHTS SECTION */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Smart Operational Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.insights.map((ins) => {
                const borderMap = {
                  POSITIVE: 'border-l-green-500 bg-green-50/40 dark:bg-green-950/20',
                  WARNING: 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20',
                  CRITICAL: 'border-l-error bg-error/10',
                  NEUTRAL: 'border-l-primary bg-primary/5',
                };
                return (
                  <Card key={ins.id} className={`border-l-4 ${borderMap[ins.type]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-on-surface">{ins.title}</h4>
                        {ins.metric && (
                          <Badge variant="neutral" size="sm" className="font-mono text-xs">
                            {ins.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-outline mt-1.5 leading-relaxed">{ins.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 3. DETAILED VISUALIZATIONS & BREAKDOWNS */}
          {summary.role === 'ADMIN' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Service Requests by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary as AdminAnalyticsSummary).categoryBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-on-surface">{item.category}</span>
                        <span className="text-outline font-mono">
                          {item.count} tickets ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Location Hotspots */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Campus Location Issue Hotspots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(summary as AdminAnalyticsSummary).locationHotspots.map((loc, idx) => (
                    <div
                      key={loc.location}
                      className="p-3 rounded-xl bg-surface-dim/40 border border-outline-variant/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{loc.location}</p>
                          <p className="text-xs text-outline">Primary Issue: {loc.primaryIssue}</p>
                        </div>
                      </div>
                      <Badge variant="warning" size="sm">
                        {loc.count} Reports
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Departmental Attendance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Departmental Attendance Compliance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {(summary as AdminAnalyticsSummary).departmentAttendance.map((dept) => (
                      <div
                        key={dept.department}
                        className="p-4 rounded-xl border border-outline-variant/30 bg-surface-dim/30 text-center space-y-1"
                      >
                        <p className="text-xs font-semibold text-outline truncate" title={dept.department}>
                          {dept.department.split('(')[1]?.replace(')', '') || dept.department}
                        </p>
                        <h4 className="text-xl font-bold text-on-surface">{dept.averageAttendance}%</h4>
                        <p className="text-[11px] text-outline">{dept.studentCount} Students</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {summary.role === 'FACULTY' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Courses Taught Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assigned Courses & Attendance Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary as FacultyAnalyticsSummary).courses.map((c) => (
                    <div key={c.offeringId} className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-dim/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="primary" size="sm" className="font-mono text-xs">
                            {c.subjectCode}
                          </Badge>
                          <h4 className="text-sm font-semibold text-on-surface mt-1">{c.subjectName}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-on-surface">{c.averageAttendance}%</span>
                          <p className="text-[11px] text-outline">Avg Attendance</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-outline border-t border-outline-variant/20 pt-2">
                        <span>{c.enrolledStudents} Enrolled</span>
                        <span>{c.submissionsReceived} Submissions</span>
                        <span className={c.atRiskCount > 0 ? 'text-error font-semibold' : 'text-green-600 font-medium'}>
                          {c.atRiskCount} At Risk
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Attendance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attendance Bracket Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary as FacultyAnalyticsSummary).attendanceDistribution.map((item) => (
                    <div key={item.bracket} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-on-surface">{item.bracket}</span>
                        <span className="text-outline font-mono">{item.count} Students</span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            item.bracket.includes('<') ? 'bg-error' : item.bracket.includes('>= 85') ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, (item.count / 130) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {summary.role === 'STUDENT' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subject Attendance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary as StudentAnalyticsSummary).subjectBreakdown.map((sub) => (
                    <div key={sub.subjectCode} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-on-surface font-semibold">{sub.subjectCode} · {sub.subjectName}</span>
                        <span className="text-primary font-mono">{sub.percentage}%</span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            sub.percentage < 75 ? 'bg-error' : sub.percentage >= 85 ? 'bg-green-500' : 'bg-primary'
                          }`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Attendance Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Semester Attendance Progression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(summary as StudentAnalyticsSummary).attendanceTimeline.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-on-surface">{item.label}</span>
                        <span className="text-outline font-mono">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 4. NATURAL LANGUAGE ANALYTICS (GEMINI REASONING) */}
          <Card className="border-2 border-primary/20 bg-surface-dim/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Natural Language Analytics Engine
                </span>
                <Badge variant="primary" size="sm">
                  Grounded in Computed Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-outline">
                Ask analytical questions about campus metrics, attendance trends, or maintenance concentration. Gemini reasons strictly over authorized ground-truth metrics.
              </p>

              {/* Sample Quick Questions */}
              <div className="flex flex-wrap gap-2">
                {(role === 'ADMIN'
                  ? [
                      'Which campus areas have the most service requests?',
                      'What are the most common campus issues?',
                      'How has attendance changed this semester?',
                      'Which service requests are still unresolved?',
                    ]
                  : role === 'FACULTY'
                  ? [
                      'How is overall student attendance in my courses?',
                      'Which courses have students at risk below 75%?',
                      'What is the assignment submission rate?',
                    ]
                  : [
                      'How is my attendance standing across all subjects?',
                      'Do I have any pending assignment deadlines?',
                      'What is my current academic standing and SGPA?',
                    ]
                ).map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => {
                      setAiQuestion(promptText);
                      handleAiAsk(promptText);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all border border-outline-variant/30"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Question Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                  placeholder="Ask an analytical question..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-outline bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={() => handleAiAsk()} disabled={isAiLoading || !aiQuestion.trim()}>
                  {isAiLoading ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>

              {/* AI Answer Display */}
              {isAiLoading && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <Spinner size="sm" />
                  <span className="text-xs text-primary font-medium">
                    Gemini reasoning over computed campus metrics...
                  </span>
                </div>
              )}

              {aiError && (
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-xs text-error">
                  {aiError}
                </div>
              )}

              {aiAnswer && !isAiLoading && (
                <div className="p-4 rounded-xl bg-surface-dim border border-outline-variant/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="w-4 h-4" />
                    Analytical Briefing Response
                  </div>
                  <div className="text-xs leading-relaxed text-on-surface whitespace-pre-line">
                    {aiAnswer}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
