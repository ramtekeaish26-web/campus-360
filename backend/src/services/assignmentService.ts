import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ROLES } from '../constants/roles.js';

export class AssignmentService {
  /**
   * Get assignments list based on role
   */
  static async getAssignments(user: { id: string; roles: string[] }, offeringId?: string) {
    if (!isDbConnected()) return [];

    if (user.roles.includes(ROLES.STUDENT)) {
      // Find offerings enrolled by student
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { courseOfferingId: true },
      });
      const allowedOfferingIds = enrollments.map((e) => e.courseOfferingId);

      return await prisma.assignment.findMany({
        where: {
          courseOfferingId: { in: offeringId ? [offeringId] : allowedOfferingIds },
          status: { in: ['ACTIVE', 'CLOSED'] },
        },
        include: {
          courseOffering: {
            include: {
              subject: true,
              faculty: { include: { profile: true } },
            },
          },
          submissions: {
            where: { studentId: user.id },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    } else if (user.roles.includes(ROLES.FACULTY)) {
      return await prisma.assignment.findMany({
        where: {
          facultyId: user.id,
          ...(offeringId && { courseOfferingId: offeringId }),
        },
        include: {
          courseOffering: { include: { subject: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'asc' },
      });
    } else {
      // Admin sees all
      return await prisma.assignment.findMany({
        where: {
          ...(offeringId && { courseOfferingId: offeringId }),
        },
        include: {
          courseOffering: {
            include: {
              subject: true,
              faculty: { include: { profile: true } },
            },
          },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'asc' },
      });
    }
  }

  /**
   * Get assignment by ID
   */
  static async getAssignmentById(id: string, user: { id: string; roles: string[] }) {
    if (!isDbConnected()) {
      throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        courseOffering: {
          include: {
            subject: true,
            faculty: { include: { profile: true } },
          },
        },
        submissions: user.roles.includes(ROLES.STUDENT)
          ? { where: { studentId: user.id } }
          : {
              include: {
                student: { include: { profile: true } },
              },
            },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    // Role check: If student, verify enrollment
    if (user.roles.includes(ROLES.STUDENT)) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseOfferingId: {
            studentId: user.id,
            courseOfferingId: assignment.courseOfferingId,
          },
        },
      });
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new AppError('You are not enrolled in this course', 403, ERROR_CODES.FORBIDDEN);
      }
    }

    return assignment;
  }

  /**
   * Create assignment (Faculty/Admin)
   */
  static async createAssignment(
    user: { id: string; roles: string[] },
    data: {
      courseOfferingId: string;
      title: string;
      description: string;
      dueDate: string | Date;
      maxMarks?: number;
      status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    }
  ) {
    if (!isDbConnected()) throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);

    const offering = await prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
    });
    if (!offering) throw new AppError('Course offering not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);

    if (!user.roles.includes(ROLES.ADMIN) && offering.facultyId !== user.id) {
      throw new AppError('You cannot create assignments for a course you do not teach', 403, ERROR_CODES.FORBIDDEN);
    }

    return await prisma.assignment.create({
      data: {
        courseOfferingId: data.courseOfferingId,
        facultyId: user.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxMarks: data.maxMarks ?? 100,
        status: data.status ?? 'ACTIVE',
      },
      include: {
        courseOffering: { include: { subject: true } },
      },
    });
  }

  /**
   * Submit assignment response (Student)
   */
  static async submitAssignment(assignmentId: string, studentId: string, content: string) {
    if (!isDbConnected()) throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new AppError('Assignment not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);

    if (assignment.status !== 'ACTIVE') {
      throw new AppError('This assignment is closed for submissions', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseOfferingId: {
          studentId,
          courseOfferingId: assignment.courseOfferingId,
        },
      },
    });
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You are not enrolled in this course', 403, ERROR_CODES.FORBIDDEN);
    }

    return await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        content,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      create: {
        assignmentId,
        studentId,
        content,
        status: 'SUBMITTED',
      },
    });
  }

  /**
   * Grade submission (Faculty/Admin)
   */
  static async gradeSubmission(
    assignmentId: string,
    studentId: string,
    user: { id: string; roles: string[] },
    data: { marks: number; feedback?: string }
  ) {
    if (!isDbConnected()) throw new AppError('Database not connected', 503, ERROR_CODES.SERVICE_UNAVAILABLE);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new AppError('Assignment not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);

    if (!user.roles.includes(ROLES.ADMIN) && assignment.facultyId !== user.id) {
      throw new AppError('You are not authorized to grade this assignment', 403, ERROR_CODES.FORBIDDEN);
    }

    if (data.marks > assignment.maxMarks) {
      throw new AppError(`Marks obtained cannot exceed maximum marks (${assignment.maxMarks})`, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    return await prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      data: {
        marks: data.marks,
        feedback: data.feedback,
        status: 'GRADED',
      },
    });
  }
}
