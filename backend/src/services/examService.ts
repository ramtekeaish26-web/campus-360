import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';

export class ExamService {
  /**
   * Calculate letter grade and grade point based on percentage score
   */
  static calculateGrade(marksObtained: number, maxMarks: number): { grade: string; gradePoint: number; percentage: number } {
    if (maxMarks <= 0) return { grade: 'F', gradePoint: 0, percentage: 0 };
    const percentage = Math.round((marksObtained / maxMarks) * 1000) / 10;

    let grade = 'F';
    let gradePoint = 0;

    if (percentage >= 90) {
      grade = 'A+';
      gradePoint = 10;
    } else if (percentage >= 80) {
      grade = 'A';
      gradePoint = 9;
    } else if (percentage >= 70) {
      grade = 'B+';
      gradePoint = 8;
    } else if (percentage >= 60) {
      grade = 'B';
      gradePoint = 7;
    } else if (percentage >= 50) {
      grade = 'C';
      gradePoint = 6;
    } else if (percentage >= 40) {
      grade = 'P';
      gradePoint = 5;
    } else {
      grade = 'F';
      gradePoint = 0;
    }

    return { grade, gradePoint, percentage };
  }

  /**
   * Get exams list based on role
   */
  static async getExams(user: { id: string; roles: string[] }, offeringId?: string) {
    if (!isDbConnected()) return [];

    let offeringFilter: any = {};
    if (offeringId) {
      offeringFilter = { id: offeringId };
    } else if (user.roles.includes(ROLES.STUDENT)) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { courseOfferingId: true },
      });
      offeringFilter = { id: { in: enrollments.map((e) => e.courseOfferingId) } };
    } else if (user.roles.includes(ROLES.FACULTY)) {
      offeringFilter = { facultyId: user.id };
    }

    return await prisma.exam.findMany({
      where: {
        courseOffering: offeringFilter,
      },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { profile: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Get exam results (with student isolation)
   */
  static async getResults(user: { id: string; roles: string[] }, studentIdParam?: string) {
    // STUDENT SECURITY RULE: Student can ONLY view their own results
    if (user.roles.includes(ROLES.STUDENT)) {
      if (studentIdParam && studentIdParam !== user.id) {
        throw new AppError('You are not authorized to view another student\'s results', 403, ERROR_CODES.FORBIDDEN);
      }
    }

    if (!isDbConnected()) return [];

    if (user.roles.includes(ROLES.STUDENT)) {
      const results = await prisma.examResult.findMany({
        where: {
          studentId: user.id,
          status: 'PUBLISHED',
        },
        include: {
          exam: true,
          courseOffering: {
            include: {
              subject: true,
              faculty: { include: { profile: true } },
            },
          },
        },
        orderBy: { exam: { date: 'desc' } },
      });

      // Compute GPA / aggregate
      let totalPoints = 0;
      let totalCredits = 0;
      for (const r of results) {
        const { gradePoint } = this.calculateGrade(r.marksObtained, r.exam.maxMarks);
        const credits = r.courseOffering.subject.credits || 4;
        totalPoints += gradePoint * credits;
        totalCredits += credits;
      }
      const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

      return {
        studentId: user.id,
        gpa,
        totalExamsCount: results.length,
        results: results.map((r) => ({
          id: r.id,
          examId: r.examId,
          examTitle: r.exam.title,
          examType: r.exam.examType,
          examDate: r.exam.date,
          subjectCode: r.courseOffering.subject.code,
          subjectName: r.courseOffering.subject.name,
          credits: r.courseOffering.subject.credits,
          marksObtained: r.marksObtained,
          maxMarks: r.exam.maxMarks,
          percentage: Math.round((r.marksObtained / r.exam.maxMarks) * 1000) / 10,
          grade: r.grade,
          remarks: r.remarks,
        })),
      };
    } else if (user.roles.includes(ROLES.FACULTY)) {
      // Faculty views results for offerings they teach
      const taughtOfferings = await prisma.courseOffering.findMany({
        where: { facultyId: user.id },
        select: { id: true },
      });
      const offeringIds = taughtOfferings.map((o) => o.id);

      const results = await prisma.examResult.findMany({
        where: {
          courseOfferingId: { in: offeringIds },
          ...(studentIdParam && { studentId: studentIdParam }),
        },
        include: {
          exam: true,
          student: { include: { profile: true } },
          courseOffering: { include: { subject: true } },
        },
        orderBy: { exam: { date: 'desc' } },
      });

      return {
        results: results.map((r) => ({
          id: r.id,
          examId: r.examId,
          examTitle: r.exam.title,
          studentId: r.studentId,
          studentName: r.student.profile ? `${r.student.profile.firstName} ${r.student.profile.lastName}` : r.student.email,
          studentPrn: r.student.profile?.prn || 'N/A',
          subjectCode: r.courseOffering.subject.code,
          marksObtained: r.marksObtained,
          maxMarks: r.exam.maxMarks,
          grade: r.grade,
          remarks: r.remarks,
          status: r.status,
        })),
      };
    } else {
      // Admin sees all results
      const results = await prisma.examResult.findMany({
        where: {
          ...(studentIdParam && { studentId: studentIdParam }),
        },
        include: {
          exam: true,
          student: { include: { profile: true } },
          courseOffering: { include: { subject: true } },
        },
        orderBy: { exam: { date: 'desc' } },
      });

      return {
        results: results.map((r) => ({
          id: r.id,
          examId: r.examId,
          examTitle: r.exam.title,
          studentId: r.studentId,
          studentName: r.student.profile ? `${r.student.profile.firstName} ${r.student.profile.lastName}` : r.student.email,
          studentPrn: r.student.profile?.prn || 'N/A',
          subjectCode: r.courseOffering.subject.code,
          marksObtained: r.marksObtained,
          maxMarks: r.exam.maxMarks,
          grade: r.grade,
          remarks: r.remarks,
          status: r.status,
        })),
      };
    }
  }

  /**
   * Schedule an exam (Faculty/Admin)
   */
  static async createExam(
    user: { id: string; roles: string[] },
    data: {
      courseOfferingId: string;
      title: string;
      examType: string;
      date: string | Date;
      startTime: string;
      endTime: string;
      room: string;
      maxMarks?: number;
    }
  ) {
    if (!isDbConnected()) throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);

    const offering = await prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
    });
    if (!offering) throw new AppError('Course offering not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);

    if (!user.roles.includes(ROLES.ADMIN) && offering.facultyId !== user.id) {
      throw new AppError('You cannot schedule exams for a course you do not teach', 403, ERROR_CODES.FORBIDDEN);
    }

    return await prisma.exam.create({
      data: {
        courseOfferingId: data.courseOfferingId,
        title: data.title,
        examType: data.examType,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        maxMarks: data.maxMarks ?? 100,
        status: 'SCHEDULED',
      },
      include: {
        courseOffering: { include: { subject: true } },
      },
    });
  }

  /**
   * Publish/Record exam result (Faculty/Admin)
   */
  static async publishResult(
    user: { id: string; roles: string[] },
    data: {
      examId: string;
      studentId: string;
      marksObtained: number;
      remarks?: string;
    }
  ) {
    if (!isDbConnected()) throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);

    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      include: { courseOffering: true },
    });
    if (!exam) throw new AppError('Exam not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);

    if (!user.roles.includes(ROLES.ADMIN) && exam.courseOffering.facultyId !== user.id) {
      throw new AppError('You are not authorized to publish results for this exam', 403, ERROR_CODES.FORBIDDEN);
    }

    if (data.marksObtained > exam.maxMarks) {
      throw new AppError(`Marks obtained cannot exceed max marks (${exam.maxMarks})`, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const { grade } = this.calculateGrade(data.marksObtained, exam.maxMarks);

    return await prisma.examResult.upsert({
      where: {
        examId_studentId: {
          examId: data.examId,
          studentId: data.studentId,
        },
      },
      update: {
        marksObtained: data.marksObtained,
        grade,
        remarks: data.remarks,
        status: 'PUBLISHED',
      },
      create: {
        examId: data.examId,
        studentId: data.studentId,
        courseOfferingId: exam.courseOfferingId,
        marksObtained: data.marksObtained,
        grade,
        remarks: data.remarks,
        status: 'PUBLISHED',
      },
    });
  }
}
