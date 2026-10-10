import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';

export interface AttendancePercentageResult {
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  absentSessions: number;
  excusedSessions: number;
  percentage: number;
}

export class AttendanceService {
  /**
   * Calculate attendance percentage based on status counts
   * Rule: PRESENT = 1.0, LATE = 0.5, EXCUSED = 1.0, ABSENT = 0.0
   */
  static calculatePercentage(records: { status: string }[]): AttendancePercentageResult {
    const totalSessions = records.length;
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        presentSessions: 0,
        lateSessions: 0,
        absentSessions: 0,
        excusedSessions: 0,
        percentage: 100, // No records yet defaults to 100%
      };
    }

    let presentSessions = 0;
    let lateSessions = 0;
    let absentSessions = 0;
    let excusedSessions = 0;

    for (const r of records) {
      switch (r.status) {
        case 'PRESENT':
          presentSessions++;
          break;
        case 'LATE':
          lateSessions++;
          break;
        case 'EXCUSED':
          excusedSessions++;
          break;
        case 'ABSENT':
        default:
          absentSessions++;
          break;
      }
    }

    const effectivePresent = presentSessions * 1.0 + lateSessions * 0.5 + excusedSessions * 1.0;
    const rawPercentage = (effectivePresent / totalSessions) * 100;
    const percentage = Math.round(rawPercentage * 10) / 10;

    return {
      totalSessions,
      presentSessions,
      lateSessions,
      absentSessions,
      excusedSessions,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }

  /**
   * Get student's own attendance summary and subject breakdown
   */
  static async getStudentAttendance(studentId: string, termId?: string) {
    if (!isDbConnected()) {
      return {
        summary: { totalSessions: 3, presentSessions: 3, lateSessions: 0, absentSessions: 0, excusedSessions: 0, percentage: 100 },
        subjects: [],
      };
    }

    // 1. Get student's active enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'ACTIVE',
        ...(termId && {
          courseOffering: { academicTermId: termId },
        }),
      },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { profile: true } },
            academicTerm: true,
          },
        },
      },
    });

    // 2. Query attendance records for this student
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        ...(termId && {
          session: { courseOffering: { academicTermId: termId } },
        }),
      },
      include: {
        session: {
          include: {
            courseOffering: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
    });

    const overall = this.calculatePercentage(records);

    // 3. Subject-wise breakdown
    const subjectMap = new Map<string, {
      offeringId: string;
      subjectCode: string;
      subjectName: string;
      facultyName: string;
      records: typeof records;
    }>();

    for (const enr of enrollments) {
      const off = enr.courseOffering;
      const facultyName = off.faculty?.profile
        ? `${off.faculty.profile.firstName} ${off.faculty.profile.lastName}`
        : 'Unassigned';

      subjectMap.set(off.id, {
        offeringId: off.id,
        subjectCode: off.subject.code,
        subjectName: off.subject.name,
        facultyName,
        records: [],
      });
    }

    for (const rec of records) {
      const offId = rec.session.courseOfferingId;
      if (subjectMap.has(offId)) {
        subjectMap.get(offId)!.records.push(rec);
      }
    }

    const subjectBreakdown = Array.from(subjectMap.values()).map((s) => {
      const stats = this.calculatePercentage(s.records);
      return {
        offeringId: s.offeringId,
        subjectCode: s.subjectCode,
        subjectName: s.subjectName,
        facultyName: s.facultyName,
        ...stats,
        recentRecords: s.records.slice(0, 5).map((r) => ({
          id: r.id,
          date: r.session.date,
          status: r.status,
          topic: r.session.topic,
          remarks: r.remarks,
        })),
      };
    });

    return {
      overall,
      subjectBreakdown,
      recentRecords: records.slice(0, 10).map((r) => ({
        id: r.id,
        subjectCode: r.session.courseOffering.subject.code,
        subjectName: r.session.courseOffering.subject.name,
        date: r.session.date,
        status: r.status,
        topic: r.session.topic,
        remarks: r.remarks,
      })),
    };
  }

  /**
   * Faculty/Admin: Record attendance session and student attendance marks
   */
  static async recordAttendanceSession(
    user: { id: string; roles: string[] },
    data: {
      courseOfferingId: string;
      date: string | Date;
      startTime: string;
      endTime: string;
      topic?: string;
      records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }[];
    }
  ) {
    if (!isDbConnected()) {
      throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);
    }

    // Verify offering authorization for faculty
    const offering = await prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
    });

    if (!offering) {
      throw new AppError('Course offering not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    if (!user.roles.includes(ROLES.ADMIN) && offering.facultyId !== user.id) {
      throw new AppError('You are not authorized to record attendance for this class', 403, ERROR_CODES.FORBIDDEN);
    }

    // Use transaction to create session and all records
    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.attendanceSession.create({
        data: {
          courseOfferingId: data.courseOfferingId,
          facultyId: user.id,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          topic: data.topic,
        },
      });

      for (const rec of data.records) {
        await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId: newSession.id,
              studentId: rec.studentId,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks,
          },
          create: {
            sessionId: newSession.id,
            studentId: rec.studentId,
            status: rec.status,
            remarks: rec.remarks,
          },
        });
      }

      return newSession;
    });

    return session;
  }

  /**
   * Get attendance sessions for an offering (Faculty/Admin)
   */
  static async getOfferingAttendance(offeringId: string, user: { id: string; roles: string[] }) {
    if (!isDbConnected()) {
      return [];
    }

    const offering = await prisma.courseOffering.findUnique({
      where: { id: offeringId },
    });

    if (!offering) {
      throw new AppError('Course offering not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    if (!user.roles.includes(ROLES.ADMIN) && offering.facultyId !== user.id) {
      throw new AppError('You do not have permission to view this class attendance', 403, ERROR_CODES.FORBIDDEN);
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: { courseOfferingId: offeringId },
      include: {
        records: {
          include: {
            student: { include: { profile: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return sessions;
  }
}
