import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../types/index.js';
import { academicApi } from '../../services/academicApi.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  User as UserIcon,
  Building2,
  BookOpen,
  Clock,
  CheckSquare,
  FileText,
  CalendarDays,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FacultyDashboardViewProps {
  user: User;
}

export const FacultyDashboardView: React.FC<FacultyDashboardViewProps> = ({ user }) => {
  const profile = user.profile;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user.email;

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['academic-dashboard', 'faculty'],
    queryFn: () => academicApi.getDashboard(),
  });

  const teachingOfferings = dashboard?.teachingOfferings || [];
  const todayClasses = dashboard?.todayClasses || [];
  const assignments = dashboard?.assignments || [];
  const exams = dashboard?.exams || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-container via-[#1E3A5F] to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="faculty" size="sm" className="bg-secondary text-white border-secondary">
                FACULTY ACADEMIC PORTAL
              </Badge>
              {dashboard?.activeTerm && (
                <span className="font-mono text-xs text-primary-fixed-dim font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                  {dashboard.activeTerm.name}
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              Welcome, Prof. {profile?.lastName || 'Faculty'} 👋
            </h1>
            <p className="text-xs md:text-sm text-primary-fixed-dim max-w-xl">
              {profile?.department?.name || 'Department of Computer Science & Engineering'} · Academic Core Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/academic/attendance"
              className="px-4 py-2 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Mark Attendance
            </Link>
            <Link
              to="/academic/assignments"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-all border border-white/20 text-white flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Assignments
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <span className="font-semibold text-xs text-on-surface-variant flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary" /> Assigned Subjects
          </span>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {teachingOfferings.length}
            </span>
            <p className="text-xs text-on-surface-variant">Allocated Course Sections</p>
          </div>
          <div className="mt-3 text-[11px] text-on-surface-variant font-mono">
            {teachingOfferings.map((o: any) => o.section).join(', ')} Sections
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <span className="font-semibold text-xs text-on-surface-variant flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-secondary" /> Today's Lectures
          </span>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {todayClasses.length}
            </span>
            <p className="text-xs text-on-surface-variant">Scheduled Sessions Today</p>
          </div>
          <div className="mt-3 text-[11px] text-secondary font-semibold">
            {todayClasses.length > 0 ? 'Timetable active' : 'No lectures today'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <span className="font-semibold text-xs text-on-surface-variant flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-tertiary" /> Active Assignments
          </span>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {assignments.length}
            </span>
            <p className="text-xs text-on-surface-variant">Continuous Assessment</p>
          </div>
          <div className="mt-3 text-[11px] text-tertiary font-semibold">
            Manage submissions & grading
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <span className="font-semibold text-xs text-on-surface-variant flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-primary" /> Managed Exams
          </span>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {exams.length}
            </span>
            <p className="text-xs text-on-surface-variant">Midterm / Quizzes</p>
          </div>
          <div className="mt-3 text-[11px] text-on-surface-variant">
            Grade entry available
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Teaching Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Today's Teaching Schedule</span>
              </CardTitle>
              <Link to="/academic/schedule" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Full Timetable <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {todayClasses.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No Lectures Scheduled for Today"
                  description="You have no classes scheduled to teach today."
                />
              ) : (
                <div className="space-y-3">
                  {todayClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline/60 flex items-center justify-between hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary-container text-on-primary font-mono font-bold text-xs">
                          {cls.startTime.slice(0, 5)} - {cls.endTime.slice(0, 5)}
                        </div>
                        <div>
                          <p className="font-bold text-xs md:text-sm text-on-surface">
                            {cls.courseOffering?.subject?.name}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {cls.courseOffering?.subject?.code} · Section {cls.section} · Room {cls.room} ({cls.building})
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/academic/attendance"
                        className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90"
                      >
                        Take Attendance
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Course Offerings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" />
                <span>Assigned Course Offerings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teachingOfferings.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Courses Assigned"
                  description="No course offerings currently allocated for this academic term."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teachingOfferings.map((offering: any) => (
                    <div
                      key={offering.id}
                      className="p-3.5 bg-surface-container-low rounded-xl border border-outline/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          {offering.subject?.code}
                        </span>
                        <Badge variant="faculty" size="sm">
                          Sec {offering.section}
                        </Badge>
                      </div>
                      <p className="font-bold text-xs text-on-surface line-clamp-1">
                        {offering.subject?.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {offering.enrollments?.length || 0} Students Enrolled · {offering.subject?.credits} Credits
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Academic Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span>Academic Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                to="/academic/attendance"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline/50 text-xs font-bold text-on-surface transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" /> Mark Class Attendance
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>

              <Link
                to="/academic/assignments"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline/50 text-xs font-bold text-on-surface transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" /> Create Assignment
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>

              <Link
                to="/academic/exams"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline/50 text-xs font-bold text-on-surface transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-tertiary" /> Schedule Exam / Quiz
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>

              <Link
                to="/academic/results"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline/50 text-xs font-bold text-on-surface transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Publish Student Grades
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
