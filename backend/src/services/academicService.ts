import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';

export class AcademicService {
  /**
   * Get all academic terms
   */
  static async getTerms() {
    if (!isDbConnected()) return [];
    return await prisma.academicTerm.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get active academic term
   */
  static async getActiveTerm() {
    if (!isDbConnected()) return null;
    return await prisma.academicTerm.findFirst({
      where: { status: 'ACTIVE' },
    });
  }

  /**
   * Get subjects list (with department & program info)
   */
  static async getSubjects(filters?: { departmentId?: string; semester?: number; status?: string }) {
    if (!isDbConnected()) return [];
    return await prisma.subject.findMany({
      where: {
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
        ...(filters?.semester && { semester: filters.semester }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        department: true,
        program: true,
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });
  }

  /**
   * Get subject by ID
   */
  static async getSubjectById(id: string) {
    if (!isDbConnected()) {
      throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);
    }
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: true,
        program: true,
        offerings: {
          include: {
            academicTerm: true,
            faculty: { include: { profile: true } },
          },
        },
      },
    });
    if (!subject) {
      throw new AppError('Subject not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    return subject;
  }

  /**
   * Get course offerings (Active term or filtered)
   */
  static async getOfferings(filters?: { termId?: string; facultyId?: string; subjectId?: string }) {
    if (!isDbConnected()) return [];
    return await prisma.courseOffering.findMany({
      where: {
        ...(filters?.termId && { academicTermId: filters.termId }),
        ...(filters?.facultyId && { facultyId: filters.facultyId }),
        ...(filters?.subjectId && { subjectId: filters.subjectId }),
      },
      include: {
        subject: { include: { department: true } },
        academicTerm: true,
        faculty: { include: { profile: true } },
        schedules: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { subject: { code: 'asc' } },
    });
  }

  /**
   * Get user schedule / weekly timetable
   */
  static async getUserSchedule(user: { id: string; roles: string[] }, dayOfWeek?: string) {
    if (!isDbConnected()) return [];

    let offeringIds: string[] = [];

    if (user.roles.includes(ROLES.STUDENT)) {
      // Find offering IDs where student is actively enrolled
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { courseOfferingId: true },
      });
      offeringIds = enrollments.map((e) => e.courseOfferingId);
    } else if (user.roles.includes(ROLES.FACULTY)) {
      // Find offering IDs where faculty is assigned
      const offerings = await prisma.courseOffering.findMany({
        where: { facultyId: user.id, status: 'ACTIVE' },
        select: { id: true },
      });
      offeringIds = offerings.map((o) => o.id);
    } else if (user.roles.includes(ROLES.ADMIN)) {
      // Admin sees all active offerings
      const offerings = await prisma.courseOffering.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      offeringIds = offerings.map((o) => o.id);
    }

    if (offeringIds.length === 0) return [];

    const schedules = await prisma.classSchedule.findMany({
      where: {
        courseOfferingId: { in: offeringIds },
        ...(dayOfWeek && { dayOfWeek: dayOfWeek.toUpperCase() }),
      },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { profile: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return schedules;
  }

  /**
   * Get today's classes
   */
  static async getTodaySchedule(user: { id: string; roles: string[] }) {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = days[new Date().getDay()];
    // On weekends, show Monday's schedule for preview if today has no classes
    const todayClasses = await this.getUserSchedule(user, currentDay);
    if (todayClasses.length === 0 && (currentDay === 'SATURDAY' || currentDay === 'SUNDAY')) {
      return {
        day: currentDay,
        isWeekend: true,
        previewDay: 'MONDAY',
        classes: await this.getUserSchedule(user, 'MONDAY'),
      };
    }
    return {
      day: currentDay,
      isWeekend: false,
      previewDay: currentDay,
      classes: todayClasses,
    };
  }

  /**
   * Get academic calendar events
   */
  static async getCalendarEvents(user: { id: string; roles: string[] }, filters?: { termId?: string; eventType?: string }) {
    if (!isDbConnected()) return [];

    let visibilityCondition: string[] = ['ALL'];
    if (user.roles.includes(ROLES.STUDENT)) {
      visibilityCondition.push('STUDENT');
    }
    if (user.roles.includes(ROLES.FACULTY)) {
      visibilityCondition.push('FACULTY');
    }
    if (user.roles.includes(ROLES.ADMIN)) {
      visibilityCondition.push('STUDENT', 'FACULTY');
    }

    return await prisma.academicCalendarEvent.findMany({
      where: {
        visibility: { in: visibilityCondition },
        ...(filters?.termId && { academicTermId: filters.termId }),
        ...(filters?.eventType && { eventType: filters.eventType }),
      },
      include: {
        academicTerm: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Complete Academic Dashboard aggregator
   */
  static async getAcademicDashboard(user: { id: string; roles: string[] }) {
    const activeTerm = await this.getActiveTerm();
    const todaySchedule = await this.getTodaySchedule(user);
    const calendarEvents = await this.getCalendarEvents(user);

    if (user.roles.includes(ROLES.STUDENT)) {
      // 1. Student enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        include: {
          courseOffering: {
            include: {
              subject: true,
              faculty: { include: { profile: true } },
            },
          },
        },
      });

      // 2. Attendance
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: user.id },
      });
      let present = 0;
      let late = 0;
      let excused = 0;
      for (const r of attendanceRecords) {
        if (r.status === 'PRESENT') present++;
        else if (r.status === 'LATE') late++;
        else if (r.status === 'EXCUSED') excused++;
      }
      const totalSessions = attendanceRecords.length;
      const attendancePct = totalSessions > 0
        ? Math.round(((present + late * 0.5 + excused) / totalSessions) * 1000) / 10
        : 100;

      // 3. Upcoming Assignments
      const offeringIds = enrollments.map((e) => e.courseOfferingId);
      const upcomingAssignments = await prisma.assignment.findMany({
        where: {
          courseOfferingId: { in: offeringIds },
          status: 'ACTIVE',
        },
        include: {
          courseOffering: { include: { subject: true } },
          submissions: { where: { studentId: user.id } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });

      // 4. Upcoming Exams
      const upcomingExams = await prisma.exam.findMany({
        where: {
          courseOfferingId: { in: offeringIds },
          status: { in: ['SCHEDULED', 'ONGOING'] },
        },
        include: {
          courseOffering: { include: { subject: true } },
        },
        orderBy: { date: 'asc' },
        take: 5,
      });

      // 5. Recent Exam Results
      const recentResults = await prisma.examResult.findMany({
        where: { studentId: user.id, status: 'PUBLISHED' },
        include: {
          exam: true,
          courseOffering: { include: { subject: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return {
        role: ROLES.STUDENT,
        activeTerm,
        todaySchedule,
        enrolledSubjectsCount: enrollments.length,
        enrolledCourses: enrollments.map((e) => ({
          offeringId: e.courseOffering.id,
          subjectCode: e.courseOffering.subject.code,
          subjectName: e.courseOffering.subject.name,
          credits: e.courseOffering.subject.credits,
          sectionName: e.courseOffering.sectionName,
          facultyName: e.courseOffering.faculty?.profile
            ? `${e.courseOffering.faculty.profile.firstName} ${e.courseOffering.faculty.profile.lastName}`
            : 'Instructor',
        })),
        attendance: {
          totalSessions,
          presentSessions: present,
          percentage: attendancePct,
        },
        upcomingAssignments: upcomingAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectCode: a.courseOffering.subject.code,
          dueDate: a.dueDate,
          maxMarks: a.maxMarks,
          isSubmitted: a.submissions.length > 0,
          submissionStatus: a.submissions[0]?.status || 'PENDING',
        })),
        upcomingExams: upcomingExams.map((e) => ({
          id: e.id,
          title: e.title,
          subjectCode: e.courseOffering.subject.code,
          examType: e.examType,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          room: e.room,
        })),
        recentResults: recentResults.map((r) => ({
          id: r.id,
          examTitle: r.exam.title,
          subjectCode: r.courseOffering.subject.code,
          marksObtained: r.marksObtained,
          maxMarks: r.exam.maxMarks,
          grade: r.grade,
        })),
        calendarHighlights: calendarEvents.slice(0, 4),
      };
    } else if (user.roles.includes(ROLES.FACULTY)) {
      // Faculty Dashboard
      const taughtOfferings = await prisma.courseOffering.findMany({
        where: { facultyId: user.id, status: 'ACTIVE' },
        include: {
          subject: true,
          _count: { select: { enrollments: true, assignments: true, attendanceSessions: true } },
        },
      });

      const facultyAssignments = await prisma.assignment.findMany({
        where: { facultyId: user.id },
        include: {
          courseOffering: { include: { subject: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return {
        role: ROLES.FACULTY,
        activeTerm,
        todaySchedule,
        assignedOfferingsCount: taughtOfferings.length,
        taughtCourses: taughtOfferings.map((o) => ({
          offeringId: o.id,
          subjectCode: o.subject.code,
          subjectName: o.subject.name,
          sectionName: o.sectionName,
          enrolledCount: o._count.enrollments,
          sessionsCount: o._count.attendanceSessions,
        })),
        recentAssignments: facultyAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subjectCode: a.courseOffering.subject.code,
          dueDate: a.dueDate,
          submissionCount: a._count.submissions,
          status: a.status,
        })),
        calendarHighlights: calendarEvents.slice(0, 4),
      };
    } else {
      // Admin Dashboard
      const totalTerms = await prisma.academicTerm.count();
      const totalSubjects = await prisma.subject.count();
      const totalOfferings = await prisma.courseOffering.count();
      const totalEnrollments = await prisma.enrollment.count();
      const totalAttendance = await prisma.attendanceRecord.count();
      const totalExams = await prisma.exam.count();

      return {
        role: ROLES.ADMIN,
        activeTerm,
        totalTerms,
        totalSubjects,
        totalOfferings,
        totalEnrollments,
        totalAttendance,
        totalExams,
        todaySchedule,
        calendarHighlights: calendarEvents.slice(0, 4),
      };
    }
  }
}
