import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { SubjectsPage } from '../pages/academic/SubjectsPage.js';
import { AttendancePage } from '../pages/academic/AttendancePage.js';
import { SchedulePage } from '../pages/academic/SchedulePage.js';
import { AssignmentsPage } from '../pages/academic/AssignmentsPage.js';
import { ExamsPage } from '../pages/academic/ExamsPage.js';
import { ResultsPage } from '../pages/academic/ResultsPage.js';
import { CalendarPage } from '../pages/academic/CalendarPage.js';
import { academicApi } from '../services/academicApi.js';

// Mock academic API
vi.mock('../services/academicApi.js', () => ({
  academicApi: {
    getDashboard: vi.fn(),
    getTerms: vi.fn(),
    getSubjects: vi.fn(),
    getSchedule: vi.fn(),
    getAttendance: vi.fn(),
    getAssignments: vi.fn(),
    getExams: vi.fn(),
    getResults: vi.fn(),
    getCalendar: vi.fn(),
    getOfferings: vi.fn(),
    recordAttendance: vi.fn(),
    createAssignment: vi.fn(),
    submitAssignment: vi.fn(),
    createExam: vi.fn(),
    publishResult: vi.fn(),
    createCalendarEvent: vi.fn(),
  },
}));

const mockStudentUser = {
  id: 'student-uuid-1',
  email: 'student@demo.local',
  roles: ['STUDENT' as const],
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  profile: {
    id: 'prof-1',
    userId: 'student-uuid-1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    prn: 'TGPCET-2023-CS-001',
    semester: 5,
    department: { id: 'dept-1', name: 'Computer Science & Engineering', code: 'CSE' },
    program: { id: 'prog-1', name: 'B.Tech in CSE', code: 'BTECH-CSE' },
  },
};

function renderWithProviders(ui: React.ReactElement, user: any = mockStudentUser) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const authValue: any = {
    user,
    token: 'mock-jwt-token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    hasRole: (role: any) => !!user?.roles?.includes(role),
    hasAnyRole: (roles: any[]) => !!user?.roles?.some((r: any) => roles.includes(r)),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Phase 2 Academic Core Frontend Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Subjects Catalog page with semester filters', async () => {
    vi.mocked(academicApi.getSubjects).mockResolvedValue([
      {
        id: 'sub-1',
        code: 'CS301',
        name: 'Database Management Systems',
        credits: 4,
        semester: 5,
        status: 'ACTIVE',
        department: { id: 'dept-1', name: 'CSE', code: 'CSE' },
      },
    ] as any);

    renderWithProviders(<SubjectsPage />);

    expect(screen.getByText(/Curriculum & Course Catalog/i)).toBeInTheDocument();
    expect(await screen.findByText('CS301')).toBeInTheDocument();
    expect(screen.getByText('Database Management Systems')).toBeInTheDocument();
  });

  it('renders Attendance page with calculation summaries and criteria', async () => {
    vi.mocked(academicApi.getAttendance).mockResolvedValue({
      overall: {
        totalSessions: 10,
        presentSessions: 9,
        lateSessions: 0,
        absentSessions: 1,
        excusedSessions: 0,
        percentage: 90,
      },
      subjectBreakdown: [
        {
          offeringId: 'off-1',
          subjectCode: 'CS301',
          subjectName: 'Database Management Systems',
          totalSessions: 5,
          presentSessions: 5,
          absentSessions: 0,
          lateSessions: 0,
          excusedSessions: 0,
          percentage: 100,
          status: 'NORMAL',
          recentRecords: [],
        },
      ],
      recentSessions: [],
    } as any);

    renderWithProviders(<AttendancePage />);

    expect(screen.getByText(/Attendance & Regulatory Compliance/i)).toBeInTheDocument();
    const percentElements = await screen.findAllByText(/90%/i);
    expect(percentElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/75% Req\./i)).toBeInTheDocument();
  });

  it('renders Weekly Schedule Timetable with day selector', async () => {
    vi.mocked(academicApi.getSchedule).mockResolvedValue([
      {
        id: 'sch-1',
        courseOfferingId: 'off-1',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00',
        room: 'Lab-301',
        building: 'Tech Block A',
        section: 'A',
        courseOffering: {
          id: 'off-1',
          section: 'A',
          subject: { id: 'sub-1', code: 'CS301', name: 'DBMS' },
          faculty: { profile: { firstName: 'Rajesh', lastName: 'Verma' } },
        },
      },
    ] as any);

    renderWithProviders(<SchedulePage />);

    expect(screen.getByText(/Weekly Timetable/i)).toBeInTheDocument();
    expect(await screen.findByText(/Lab-301/i)).toBeInTheDocument();
  });

  it('renders Assignments page with active continuous assessments', async () => {
    vi.mocked(academicApi.getAssignments).mockResolvedValue([
      {
        id: 'asg-1',
        courseOfferingId: 'off-1',
        facultyId: 'fac-1',
        title: 'SQL Normalization Problem Set',
        description: 'Design 3NF schemas',
        dueDate: '2026-10-15T23:59:59Z',
        createdAt: '2026-10-01',
        status: 'ACTIVE',
        courseOffering: { subject: { code: 'CS301', name: 'DBMS' } },
        submissions: [],
      },
    ] as any);

    renderWithProviders(<AssignmentsPage />);

    expect(screen.getByText(/Continuous Assessment & Course Assignments/i)).toBeInTheDocument();
    expect(await screen.findByText(/SQL Normalization Problem Set/i)).toBeInTheDocument();
  });

  it('renders Exams page with schedule and hall ticket status', async () => {
    vi.mocked(academicApi.getExams).mockResolvedValue([
      {
        id: 'exam-1',
        courseOfferingId: 'off-1',
        title: 'DBMS Midterm Theory Exam',
        examType: 'MIDTERM',
        date: '2026-10-25T00:00:00Z',
        startTime: '10:00',
        endTime: '12:00',
        room: 'Auditorium Hall 1',
        status: 'SCHEDULED',
        courseOffering: { subject: { code: 'CS301', name: 'DBMS' } },
      },
    ] as any);

    renderWithProviders(<ExamsPage />);

    expect(screen.getByText(/Autonomous Examination Schedule/i)).toBeInTheDocument();
    expect(await screen.findByText(/DBMS Midterm Theory Exam/i)).toBeInTheDocument();
  });

  it('renders Results page with GPA Scorecard and letter grades', async () => {
    vi.mocked(academicApi.getResults).mockResolvedValue({
      studentId: 'student-uuid-1',
      gpa: 9.2,
      totalCredits: 22,
      results: [
        {
          id: 'res-1',
          studentId: 'student-uuid-1',
          examId: 'exam-1',
          courseOfferingId: 'off-1',
          marks: 48,
          maxMarks: 50,
          grade: 'A+',
          status: 'PUBLISHED',
          exam: { title: 'Midterm Evaluation' },
          courseOffering: { subject: { code: 'CS301', name: 'DBMS', credits: 4 } },
        },
      ],
    } as any);

    renderWithProviders(<ResultsPage />);

    expect(screen.getByText(/Grades & Autonomous Evaluation Ledger/i)).toBeInTheDocument();
    expect(await screen.findByText('9.20')).toBeInTheDocument();
    expect(screen.getByText(/A\+ \(Outstanding\)/i)).toBeInTheDocument();
  });

  it('renders Academic Calendar with category filters', async () => {
    vi.mocked(academicApi.getCalendar).mockResolvedValue([
      {
        id: 'cal-1',
        title: 'Mid-Semester Examinations Period',
        description: 'Theory and practical assessments',
        eventType: 'EXAM',
        visibility: 'ALL',
        startDate: '2026-10-20T00:00:00Z',
        endDate: '2026-10-30T00:00:00Z',
      },
    ] as any);

    renderWithProviders(<CalendarPage />);

    expect(screen.getByText(/Institutional Academic Calendar/i)).toBeInTheDocument();
    expect(await screen.findByText('Mid-Semester Examinations Period')).toBeInTheDocument();
  });
});
