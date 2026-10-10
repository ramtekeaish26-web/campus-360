import { z } from 'zod';

export const createAcademicTermSchema = z.object({
  name: z.string().min(3, 'Term name must be at least 3 characters'),
  academicYear: z.string().min(4, 'Academic year required (e.g. 2025-26)'),
  semester: z.number().int().min(1).max(8),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).default('ACTIVE'),
});

export const updateAcademicTermSchema = createAcademicTermSchema.partial();

export const createSubjectSchema = z.object({
  code: z.string().min(2).max(20).transform((v) => v.toUpperCase().trim()),
  name: z.string().min(3, 'Subject name must be at least 3 characters'),
  description: z.string().optional(),
  credits: z.number().int().min(1).max(10).default(4),
  departmentId: z.string().uuid('Valid department ID required'),
  programId: z.string().uuid().optional().nullable(),
  semester: z.number().int().min(1).max(8).default(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createOfferingSchema = z.object({
  subjectId: z.string().uuid(),
  academicTermId: z.string().uuid(),
  sectionName: z.string().min(1).max(20).default('A'),
  facultyId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).default('ACTIVE'),
});

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  courseOfferingId: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED']).default('ACTIVE'),
});

export const createScheduleSchema = z.object({
  courseOfferingId: z.string().uuid(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format must be HH:MM'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format must be HH:MM'),
  room: z.string().min(1, 'Room number/name required'),
  building: z.string().default('Academic Block A'),
});

export const recordAttendanceSessionSchema = z.object({
  courseOfferingId: z.string().uuid(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  topic: z.string().optional(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().optional(),
    })
  ).min(1, 'At least one student record is required'),
});

export const createAssignmentSchema = z.object({
  courseOfferingId: z.string().uuid(),
  title: z.string().min(3, 'Assignment title must be at least 3 characters'),
  description: z.string().min(5, 'Assignment description is required'),
  dueDate: z.string().datetime(),
  maxMarks: z.number().positive().default(100),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).default('ACTIVE'),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const submitAssignmentSchema = z.object({
  content: z.string().min(1, 'Submission content cannot be empty'),
});

export const gradeAssignmentSubmissionSchema = z.object({
  studentId: z.string().uuid(),
  marks: z.number().min(0),
  feedback: z.string().optional(),
});

export const createExamSchema = z.object({
  courseOfferingId: z.string().uuid(),
  title: z.string().min(3, 'Exam title must be at least 3 characters'),
  examType: z.enum(['MIDTERM', 'END_SEMESTER', 'PRACTICAL', 'QUIZ']),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  room: z.string().min(1, 'Room is required'),
  maxMarks: z.number().positive().default(100),
});

export const publishExamResultSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
  marksObtained: z.number().min(0),
  remarks: z.string().optional(),
});

export const createCalendarEventSchema = z.object({
  academicTermId: z.string().uuid().optional().nullable(),
  title: z.string().min(3, 'Event title must be at least 3 characters'),
  description: z.string().optional(),
  eventType: z.enum(['ACADEMIC', 'EXAM', 'HOLIDAY', 'DEADLINE', 'OTHER']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  visibility: z.enum(['ALL', 'STUDENT', 'FACULTY']).default('ALL'),
});
