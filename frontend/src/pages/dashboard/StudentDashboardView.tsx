import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../types/index.js';
import { academicApi } from '../../services/academicApi.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  User as UserIcon,
  GraduationCap,
  BookOpen,
  Clock,
  CheckSquare,
  FileText,
  CalendarDays,
  Award,
  CalendarRange,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentDashboardViewProps {
  user: User;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ user }) => {
  const profile = user.profile;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user.email;

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['academic-dashboard', 'student'],
    queryFn: () => academicApi.getDashboard(),
  });

  const attendance = dashboard?.attendance;
  const todayClasses = dashboard?.todayClasses || [];
  const upcomingAssignments = dashboard?.upcomingAssignments || [];
  const upcomingExams = dashboard?.upcomingExams || [];
  const recentResults = dashboard?.recentResults || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-container via-[#1E3A5F] to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="student" size="sm" className="bg-white/10 text-white border-white/20">
                STUDENT ACADEMIC COCKPIT
              </Badge>
              {dashboard?.activeTerm && (
                <span className="font-mono text-xs text-primary-fixed-dim font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                  {dashboard.activeTerm.name}
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              Welcome back, {profile?.firstName || 'Student'} 👋
            </h1>
            <p className="text-xs md:text-sm text-primary-fixed-dim max-w-xl">
              {profile?.department?.name || 'Department of Computer Science & Engineering'} · Semester {profile?.semester || 5}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/academic/schedule"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-all border border-white/20 text-white flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Timetable
            </Link>
            <Link
              to="/academic/attendance"
              className="px-4 py-2 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Academic Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-primary" /> Overall Attendance
            </span>
            {attendance && attendance.percentage < 75 && (
              <span className="text-[10px] text-error font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Shortage
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {isLoading ? '...' : attendance ? `${attendance.percentage}%` : '100%'}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {attendance ? `${attendance.attendedSessions}/${attendance.totalSessions} Sessions` : '0 Recorded'}
            </span>
          </div>
          <div className="mt-3 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                (attendance?.percentage || 100) >= 75
                  ? 'bg-secondary-container'
                  : 'bg-error'
              }`}
              style={{ width: `${Math.min(attendance?.percentage || 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Enrolled Subjects */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-secondary" /> Enrolled Subjects
            </span>
            <Link to="/academic/subjects" className="text-primary hover:underline text-[11px] font-bold">
              View
            </Link>
          </div>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {dashboard?.enrolledCourses?.length || 0}
            </span>
            <p className="text-xs text-on-surface-variant">Active Courses in Current Term</p>
          </div>
          <div className="mt-3 text-[11px] text-on-surface-variant font-mono">
            {dashboard?.enrolledCourses?.slice(0, 2).map((c: any) => c.subject?.code).join(' · ')}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-tertiary" /> Active Assignments
            </span>
            <Link to="/academic/assignments" className="text-primary hover:underline text-[11px] font-bold">
              View
            </Link>
          </div>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {upcomingAssignments.length}
            </span>
            <p className="text-xs text-on-surface-variant">Pending Continuous Assessment</p>
          </div>
          <div className="mt-3 text-[11px] text-tertiary font-semibold">
            {upcomingAssignments.length > 0 ? 'Submission open' : 'All assignments submitted'}
          </div>
        </div>

        {/* Scheduled Exams */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" /> Upcoming Exams
            </span>
            <Link to="/academic/exams" className="text-primary hover:underline text-[11px] font-bold">
              View
            </Link>
          </div>
          <div className="mt-2">
            <span className="font-display font-bold text-2xl text-on-surface">
              {upcomingExams.length}
            </span>
            <p className="text-xs text-on-surface-variant">Midterm / End-Sem Evaluations</p>
          </div>
          <div className="mt-3 text-[11px] text-on-surface-variant">
            {upcomingExams[0]?.title || 'No imminent exams'}
          </div>
        </div>
      </div>

      {/* Main Two-Column Academic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule & Upcoming Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Class Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Today's Lectures & Timetable</span>
              </CardTitle>
              <Link to="/academic/schedule" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Full Week <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {todayClasses.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No Lectures Scheduled Today"
                  description="You have no classes programmed for today on your timetable."
                />
              ) : (
                <div className="space-y-3">
                  {todayClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline/60 flex items-center justify-between hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-lg bg-primary-container text-on-primary font-mono font-bold text-xs shrink-0">
                          {cls.startTime.slice(0, 5)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs md:text-sm text-on-surface truncate">
                            {cls.courseOffering?.subject?.name || 'Lecture'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {cls.courseOffering?.subject?.code} · Section {cls.section} · Room {cls.room} ({cls.building})
                          </p>
                        </div>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {cls.courseOffering?.faculty?.profile
                          ? `Prof. ${cls.courseOffering.faculty.profile.lastName}`
                          : 'Faculty'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments Due */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-secondary" />
                <span>Active Assignments</span>
              </CardTitle>
              <Link to="/academic/assignments" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Pending Assignments"
                  description="You're all caught up with your continuous assessment tasks."
                />
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline/60 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{assignment.title}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {assignment.courseOffering?.subject?.name} · Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to="/academic/assignments"
                        className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors"
                      >
                        Submit
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Exam & Results Snapshot */}
        <div className="space-y-6">
          {/* Exam Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>Examination Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingExams.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No Exams Scheduled"
                  description="No upcoming examination dates released for this term."
                />
              ) : (
                <div className="space-y-3">
                  {upcomingExams.map((exam: any) => (
                    <div key={exam.id} className="p-3 bg-surface-container-low rounded-xl border border-outline/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-primary">{exam.examType}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                          {new Date(exam.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-on-surface truncate">{exam.title}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {exam.courseOffering?.subject?.code} · Room {exam.room || 'TBA'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Published Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                <span>Recent Results</span>
              </CardTitle>
              <Link to="/academic/results" className="text-xs font-bold text-primary hover:underline">
                Scorecard
              </Link>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No Results Published"
                  description="Official grade results will appear here once published."
                />
              ) : (
                <div className="space-y-2.5">
                  {recentResults.map((res: any) => (
                    <div key={res.id} className="p-2.5 bg-surface-container-low rounded-lg border border-outline/50 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{res.exam?.title || 'Evaluation'}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant">
                          Score: {res.marks}/{res.maxMarks}
                        </p>
                      </div>
                      <Badge variant={res.grade === 'F' ? 'admin' : 'student'} size="sm">
                        Grade {res.grade || 'P'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phase 4: Campus Services & Engagement Quick Panel */}
      <div className="pt-4 border-t border-surface-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
            <span>Campus Services & Live Updates</span>
          </h2>
          <Link to="/services" className="text-xs font-bold text-primary hover:underline">
            Explore All Services
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/notices"
            className="p-4 bg-surface-container-lowest border border-outline rounded-xl hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Notices & Circulars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Read urgent examination, academic, and administrative circulars.
            </p>
          </Link>

          <Link
            to="/events"
            className="p-4 bg-surface-container-lowest border border-outline rounded-xl hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Upcoming Fests & Hackathons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Register for coding hackathons, cultural events, and technical workshops.
            </p>
          </Link>

          <Link
            to="/services/requests"
            className="p-4 bg-surface-container-lowest border border-outline rounded-xl hover:border-primary/40 transition-all group"
          >
            <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors flex items-center justify-between">
              <span>Helpdesk & Utilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Report Wi-Fi issues, electrical faults, or classroom hardware requests.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
