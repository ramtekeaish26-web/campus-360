import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.js';
import { AcademicService } from '../services/academicService.js';
import { AttendanceService } from '../services/attendanceService.js';
import { AssignmentService } from '../services/assignmentService.js';
import { ExamService } from '../services/examService.js';
import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AcademicController {
  // 1. Dashboard
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AcademicService.getAcademicDashboard(req.user!);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  // 2. Terms & Subjects
  static async getTerms(req: Request, res: Response, next: NextFunction) {
    try {
      const terms = await AcademicService.getTerms();
      return sendSuccess(res, terms);
    } catch (err) {
      next(err);
    }
  }

  static async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId, semester, status } = req.query;
      const subjects = await AcademicService.getSubjects({
        departmentId: departmentId as string,
        semester: semester ? parseInt(semester as string, 10) : undefined,
        status: status as string,
      });
      return sendSuccess(res, subjects);
    } catch (err) {
      next(err);
    }
  }

  static async getSubjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const subject = await AcademicService.getSubjectById(req.params.id);
      return sendSuccess(res, subject);
    } catch (err) {
      next(err);
    }
  }

  // 3. Course Offerings
  static async getOfferings(req: Request, res: Response, next: NextFunction) {
    try {
      const { termId, facultyId, subjectId } = req.query;
      const offerings = await AcademicService.getOfferings({
        termId: termId as string,
        facultyId: facultyId as string,
        subjectId: subjectId as string,
      });
      return sendSuccess(res, offerings);
    } catch (err) {
      next(err);
    }
  }

  // 4. Schedule & Today
  static async getSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { dayOfWeek } = req.query;
      const schedule = await AcademicService.getUserSchedule(req.user!, dayOfWeek as string);
      return sendSuccess(res, schedule);
    } catch (err) {
      next(err);
    }
  }

  static async getTodaySchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const today = await AcademicService.getTodaySchedule(req.user!);
      return sendSuccess(res, today);
    } catch (err) {
      next(err);
    }
  }

  // 5. Attendance
  static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { termId } = req.query;
      const data = await AttendanceService.getStudentAttendance(req.user!.id, termId as string);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async recordAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await AttendanceService.recordAttendanceSession(req.user!, req.body);
      return sendSuccess(res, session, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getOfferingAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await AttendanceService.getOfferingAttendance(req.params.offeringId, req.user!);
      return sendSuccess(res, sessions);
    } catch (err) {
      next(err);
    }
  }

  // 6. Assignments
  static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { offeringId } = req.query;
      const assignments = await AssignmentService.getAssignments(req.user!, offeringId as string);
      return sendSuccess(res, assignments);
    } catch (err) {
      next(err);
    }
  }

  static async getAssignmentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.getAssignmentById(req.params.id, req.user!);
      return sendSuccess(res, assignment);
    } catch (err) {
      next(err);
    }
  }

  static async createAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.createAssignment(req.user!, req.body);
      return sendSuccess(res, assignment, 201);
    } catch (err) {
      next(err);
    }
  }

  static async submitAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const submission = await AssignmentService.submitAssignment(req.params.id, req.user!.id, req.body.content);
      return sendSuccess(res, submission, 201);
    } catch (err) {
      next(err);
    }
  }

  static async gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const submission = await AssignmentService.gradeSubmission(req.params.id, studentId, req.user!, req.body);
      return sendSuccess(res, submission);
    } catch (err) {
      next(err);
    }
  }

  // 7. Exams & Results
  static async getExams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { offeringId } = req.query;
      const exams = await ExamService.getExams(req.user!, offeringId as string);
      return sendSuccess(res, exams);
    } catch (err) {
      next(err);
    }
  }

  static async createExam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const exam = await ExamService.createExam(req.user!, req.body);
      return sendSuccess(res, exam, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.query;
      const results = await ExamService.getResults(req.user!, studentId as string);
      return sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  }

  static async publishResult(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.publishResult(req.user!, req.body);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  // 8. Calendar
  static async getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { termId, eventType } = req.query;
      const events = await AcademicService.getCalendarEvents(req.user!, {
        termId: termId as string,
        eventType: eventType as string,
      });
      return sendSuccess(res, events);
    } catch (err) {
      next(err);
    }
  }

  // 9. Admin Academic Management Handlers
  static async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDbConnected()) {
        return sendSuccess(res, { id: 'mock-sub-id', ...req.body }, 201);
      }
      const subject = await prisma.subject.create({
        data: req.body,
      });
      return sendSuccess(res, subject, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDbConnected()) {
        return sendSuccess(res, { id: req.params.id, ...req.body });
      }
      const subject = await prisma.subject.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return sendSuccess(res, subject);
    } catch (err) {
      next(err);
    }
  }

  static async createOffering(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDbConnected()) {
        return sendSuccess(res, { id: 'mock-off-id', ...req.body }, 201);
      }
      const offering = await prisma.courseOffering.create({
        data: req.body,
        include: { subject: true, academicTerm: true },
      });
      return sendSuccess(res, offering, 201);
    } catch (err) {
      next(err);
    }
  }

  static async createEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDbConnected()) {
        return sendSuccess(res, { id: 'mock-enr-id', ...req.body }, 201);
      }
      const enrollment = await prisma.enrollment.create({
        data: req.body,
        include: { courseOffering: { include: { subject: true } }, student: true },
      });
      return sendSuccess(res, enrollment, 201);
    } catch (err) {
      next(err);
    }
  }

  static async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!isDbConnected()) {
        return sendSuccess(res, { id: 'mock-sch-id', ...req.body }, 201);
      }
      const schedule = await prisma.classSchedule.create({
        data: req.body,
      });
      return sendSuccess(res, schedule, 201);
    } catch (err) {
      next(err);
    }
  }

  static async createCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, academicTermId, title, description, eventType, visibility } = req.body;
      if (!isDbConnected()) {
        return sendSuccess(
          res,
          {
            id: 'mock-cal-id',
            title,
            description: description || null,
            eventType,
            visibility: visibility || 'ALL',
            academicTermId: academicTermId || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
          201
        );
      }
      const event = await prisma.academicCalendarEvent.create({
        data: {
          title,
          description: description || null,
          eventType,
          visibility: visibility || 'ALL',
          academicTermId: academicTermId || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });
      return sendSuccess(res, event, 201);
    } catch (err) {
      next(err);
    }
  }
}
