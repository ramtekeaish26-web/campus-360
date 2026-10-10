import { Router } from 'express';
import { AcademicController } from '../controllers/academicController.js';
import { requireAuth, requireRole, requireAnyRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
  createOfferingSchema,
  createEnrollmentSchema,
  createScheduleSchema,
  recordAttendanceSessionSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeAssignmentSubmissionSchema,
  createExamSchema,
  publishExamResultSchema,
  createCalendarEventSchema,
} from '../validators/academicValidators.js';

const router = Router();

// All academic routes require valid authentication
router.use(requireAuth);

// 1. Dashboard
router.get('/dashboard', AcademicController.getDashboard);

// 2. Terms & Subjects
router.get('/terms', AcademicController.getTerms);
router.get('/subjects', AcademicController.getSubjects);
router.get('/subjects/:id', AcademicController.getSubjectById);

// 3. Course Offerings
router.get('/offerings', AcademicController.getOfferings);

// 4. Schedule & Today
router.get('/schedule', AcademicController.getSchedule);
router.get('/schedule/today', AcademicController.getTodaySchedule);

// 5. Attendance
router.get('/attendance', AcademicController.getAttendance);
router.get('/attendance/offering/:offeringId', requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]), AcademicController.getOfferingAttendance);
router.post(
  '/attendance/sessions',
  requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]),
  validateBody(recordAttendanceSessionSchema),
  AcademicController.recordAttendance
);

// 6. Assignments
router.get('/assignments', AcademicController.getAssignments);
router.get('/assignments/:id', AcademicController.getAssignmentById);
router.post(
  '/assignments',
  requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]),
  validateBody(createAssignmentSchema),
  AcademicController.createAssignment
);
router.post(
  '/assignments/:id/submit',
  requireRole(ROLES.STUDENT),
  validateBody(submitAssignmentSchema),
  AcademicController.submitAssignment
);
router.post(
  '/assignments/:id/grade/:studentId',
  requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]),
  validateBody(gradeAssignmentSubmissionSchema),
  AcademicController.gradeSubmission
);

// 7. Exams & Results
router.get('/exams', AcademicController.getExams);
router.post(
  '/exams',
  requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]),
  validateBody(createExamSchema),
  AcademicController.createExam
);
router.get('/results', AcademicController.getResults);
router.post(
  '/results',
  requireAnyRole([ROLES.FACULTY, ROLES.ADMIN]),
  validateBody(publishExamResultSchema),
  AcademicController.publishResult
);

// 8. Academic Calendar
router.get('/calendar', AcademicController.getCalendar);
router.post(
  '/calendar',
  requireRole(ROLES.ADMIN),
  validateBody(createCalendarEventSchema),
  AcademicController.createCalendarEvent
);

// 9. Admin Academic Operations
router.post('/admin/subjects', requireRole(ROLES.ADMIN), validateBody(createSubjectSchema), AcademicController.createSubject);
router.patch('/admin/subjects/:id', requireRole(ROLES.ADMIN), validateBody(updateSubjectSchema), AcademicController.updateSubject);
router.post('/admin/offerings', requireRole(ROLES.ADMIN), validateBody(createOfferingSchema), AcademicController.createOffering);
router.post('/admin/enrollments', requireRole(ROLES.ADMIN), validateBody(createEnrollmentSchema), AcademicController.createEnrollment);
router.post('/admin/schedules', requireRole(ROLES.ADMIN), validateBody(createScheduleSchema), AcademicController.createSchedule);

export default router;
