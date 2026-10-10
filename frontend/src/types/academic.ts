export interface AcademicTerm {
  id: string;
  name: string;
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  semester: number;
  status: 'ACTIVE' | 'INACTIVE';
  department?: {
    id: string;
    code: string;
    name: string;
  };
  program?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface CourseOffering {
  id: string;
  subjectId: string;
  academicTermId: string;
  sectionName: string;
  status: string;
  subject: Subject;
  academicTerm: AcademicTerm;
  faculty?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  _count?: {
    enrollments?: number;
    assignments?: number;
    attendanceSessions?: number;
  };
}

export interface ClassScheduleItem {
  id: string;
  courseOfferingId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  courseOffering: {
    id: string;
    sectionName: string;
    subject: Subject;
    faculty?: {
      profile?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  };
}

export interface AttendancePercentageStats {
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  absentSessions: number;
  excusedSessions: number;
  percentage: number;
}

export interface SubjectAttendanceBreakdown extends AttendancePercentageStats {
  offeringId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  recentRecords: {
    id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    topic?: string | null;
    remarks?: string | null;
  }[];
}

export interface AttendanceData {
  overall: AttendancePercentageStats;
  subjectBreakdown: SubjectAttendanceBreakdown[];
  recentRecords: {
    id: string;
    subjectCode: string;
    subjectName: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    topic?: string | null;
    remarks?: string | null;
  }[];
}

export interface AssignmentItem {
  id: string;
  courseOfferingId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  courseOffering: {
    subject: Subject;
    faculty?: {
      profile?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  };
  submissions?: {
    id: string;
    studentId: string;
    content: string;
    submittedAt: string;
    marks?: number | null;
    feedback?: string | null;
    status: 'SUBMITTED' | 'GRADED' | 'RESUBMIT_REQUESTED';
    student?: {
      email: string;
      profile?: {
        firstName: string;
        lastName: string;
        prn?: string | null;
      } | null;
    };
  }[];
  _count?: {
    submissions?: number;
  };
}

export interface ExamItem {
  id: string;
  courseOfferingId: string;
  title: string;
  examType: 'MIDTERM' | 'END_SEMESTER' | 'PRACTICAL' | 'QUIZ';
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  maxMarks: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  courseOffering: {
    subject: Subject;
    faculty?: {
      profile?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  };
}

export interface StudentExamResultItem {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  examDate: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks?: string | null;
}

export interface AcademicCalendarEventItem {
  id: string;
  academicTermId?: string | null;
  title: string;
  description?: string | null;
  eventType: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'DEADLINE' | 'OTHER';
  startDate: string;
  endDate: string;
  visibility: 'ALL' | 'STUDENT' | 'FACULTY';
}
