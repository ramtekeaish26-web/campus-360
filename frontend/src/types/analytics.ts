export type TimeRangePeriod = 'today' | '7d' | '30d' | 'semester' | 'all';

export interface SmartInsight {
  id: string;
  type: 'POSITIVE' | 'WARNING' | 'NEUTRAL' | 'CRITICAL';
  title: string;
  description: string;
  metric?: string;
}

export interface StudentAnalyticsSummary {
  role: 'STUDENT';
  studentId: string;
  timeRange: TimeRangePeriod;
  kpis: {
    overallAttendance: number;
    totalSessions: number;
    attendedSessions: number;
    assignmentCompletionRate: number;
    submittedAssignments: number;
    pendingAssignments: number;
    sgpa: number;
    openServiceTickets: number;
  };
  attendanceTimeline: Array<{
    label: string;
    percentage: number;
  }>;
  subjectBreakdown: Array<{
    subjectCode: string;
    subjectName: string;
    percentage: number;
  }>;
  insights: SmartInsight[];
}

export interface FacultyAnalyticsSummary {
  role: 'FACULTY';
  facultyId: string;
  timeRange: TimeRangePeriod;
  kpis: {
    coursesTaught: number;
    totalEnrolledStudents: number;
    averageClassAttendance: number;
    studentsBelowThreshold: number;
    activeAssignments: number;
  };
  courses: Array<{
    offeringId: string;
    subjectCode: string;
    subjectName: string;
    enrolledStudents: number;
    averageAttendance: number;
    submissionsReceived: number;
    atRiskCount: number;
  }>;
  attendanceDistribution: Array<{
    bracket: string;
    count: number;
  }>;
  insights: SmartInsight[];
}

export interface AdminAnalyticsSummary {
  role: 'ADMIN';
  timeRange: TimeRangePeriod;
  kpis: {
    activeStudents: number;
    activeFaculty: number;
    openServiceRequests: number;
    resolvedServiceRequests: number;
    meanResolutionHours: number;
    campusWideAttendance: number;
    activeEvents: number;
    publishedNotices: number;
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  locationHotspots: Array<{
    location: string;
    count: number;
    primaryIssue: string;
  }>;
  departmentAttendance: Array<{
    department: string;
    averageAttendance: number;
    studentCount: number;
  }>;
  monthlyRequestTrends: Array<{
    month: string;
    received: number;
    resolved: number;
  }>;
  insights: SmartInsight[];
}

export type AnalyticsSummaryResponse = StudentAnalyticsSummary | FacultyAnalyticsSummary | AdminAnalyticsSummary;

export interface AIExplanationResponse {
  answer: string;
  metricsUsed: any;
}
