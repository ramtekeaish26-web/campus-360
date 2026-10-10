import { apiClient } from './apiClient.js';
import {
  AcademicTerm,
  Subject,
  CourseOffering,
  ClassScheduleItem,
  AttendanceData,
  AssignmentItem,
  ExamItem,
  StudentExamResultItem,
  AcademicCalendarEventItem,
} from '../types/academic.js';

export const academicApi = {
  // 1. Dashboard
  getDashboard: () => apiClient.get<any>('/academic/dashboard'),

  // 2. Terms & Subjects
  getTerms: () => apiClient.get<AcademicTerm[]>('/academic/terms'),
  getSubjects: (params?: { departmentId?: string; semester?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.semester) query.append('semester', params.semester.toString());
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return apiClient.get<Subject[]>(`/academic/subjects${qs ? `?${qs}` : ''}`);
  },
  getSubjectById: (id: string) => apiClient.get<Subject>(`/academic/subjects/${id}`),

  // 3. Offerings
  getOfferings: (params?: { termId?: string; facultyId?: string }) => {
    const query = new URLSearchParams();
    if (params?.termId) query.append('termId', params.termId);
    if (params?.facultyId) query.append('facultyId', params.facultyId);
    const qs = query.toString();
    return apiClient.get<CourseOffering[]>(`/academic/offerings${qs ? `?${qs}` : ''}`);
  },

  // 4. Schedule & Today
  getSchedule: (dayOfWeek?: string) => {
    return apiClient.get<ClassScheduleItem[]>(
      `/academic/schedule${dayOfWeek ? `?dayOfWeek=${dayOfWeek}` : ''}`
    );
  },
  getTodaySchedule: () => apiClient.get<any>('/academic/schedule/today'),

  // 5. Attendance
  getAttendance: (termId?: string) => {
    return apiClient.get<AttendanceData>(
      `/academic/attendance${termId ? `?termId=${termId}` : ''}`
    );
  },
  getOfferingAttendance: (offeringId: string) => {
    return apiClient.get<any[]>(`/academic/attendance/offering/${offeringId}`);
  },
  recordAttendanceSession: (data: {
    courseOfferingId: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
    records: { studentId: string; status: string; remarks?: string }[];
  }) => {
    return apiClient.post('/academic/attendance/sessions', data);
  },

  // 6. Assignments
  getAssignments: (offeringId?: string) => {
    return apiClient.get<AssignmentItem[]>(
      `/academic/assignments${offeringId ? `?offeringId=${offeringId}` : ''}`
    );
  },
  getAssignmentById: (id: string) => apiClient.get<AssignmentItem>(`/academic/assignments/${id}`),
  createAssignment: (data: {
    courseOfferingId: string;
    title: string;
    description: string;
    dueDate: string;
    maxMarks?: number;
  }) => {
    return apiClient.post<AssignmentItem>('/academic/assignments', data);
  },
  submitAssignment: (id: string, content: string) => {
    return apiClient.post(`/academic/assignments/${id}/submit`, { content });
  },
  gradeSubmission: (id: string, studentId: string, data: { marks: number; feedback?: string }) => {
    return apiClient.post(`/academic/assignments/${id}/grade/${studentId}`, data);
  },

  // 7. Exams & Results
  getExams: (offeringId?: string) => {
    return apiClient.get<ExamItem[]>(
      `/academic/exams${offeringId ? `?offeringId=${offeringId}` : ''}`
    );
  },
  createExam: (data: {
    courseOfferingId: string;
    title: string;
    examType: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    maxMarks?: number;
  }) => {
    return apiClient.post<ExamItem>('/academic/exams', data);
  },
  getResults: (studentId?: string) => {
    return apiClient.get<{ gpa: number; results: StudentExamResultItem[] }>(
      `/academic/results${studentId ? `?studentId=${studentId}` : ''}`
    );
  },
  publishResult: (data: {
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
  }) => {
    return apiClient.post('/academic/results', data);
  },

  // 8. Calendar
  getCalendar: (params?: { termId?: string; eventType?: string }) => {
    const query = new URLSearchParams();
    if (params?.termId) query.append('termId', params.termId);
    if (params?.eventType) query.append('eventType', params.eventType);
    const qs = query.toString();
    return apiClient.get<AcademicCalendarEventItem[]>(`/academic/calendar${qs ? `?${qs}` : ''}`);
  },
  createCalendarEvent: (data: any) => apiClient.post('/academic/calendar', data),

  // 9. Admin Operations
  createSubject: (data: any) => apiClient.post('/academic/admin/subjects', data),
  createOffering: (data: any) => apiClient.post('/academic/admin/offerings', data),
  createEnrollment: (data: any) => apiClient.post('/academic/admin/enrollments', data),
  createSchedule: (data: any) => apiClient.post('/academic/admin/schedules', data),
};
