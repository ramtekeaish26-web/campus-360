import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Campus 360 Phase 2 Academic Core Seeding...');

  // 1. Roles
  const studentRole = await prisma.role.upsert({
    where: { code: 'STUDENT' },
    update: {},
    create: {
      code: 'STUDENT',
      name: 'Student',
      description: 'Enrolled student with access to academic dashboard, attendance, timetable, and assignments.',
    },
  });

  const facultyRole = await prisma.role.upsert({
    where: { code: 'FACULTY' },
    update: {},
    create: {
      code: 'FACULTY',
      name: 'Faculty',
      description: 'Academic instructor managing assigned subjects, classes, attendance, assignments, and grading.',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Admin',
      description: 'Institutional system administrator with full management access to academic operations.',
    },
  });

  // 2. Departments
  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      description: 'Department of Computer Science & Engineering, Autonomous Division',
    },
  });

  const mechDept = await prisma.department.upsert({
    where: { code: 'MECH' },
    update: {},
    create: {
      code: 'MECH',
      name: 'Mechanical Engineering',
      description: 'Department of Mechanical Engineering, Autonomous Division',
    },
  });

  // 3. Programs
  const btechCse = await prisma.program.upsert({
    where: { code: 'BTECH_CSE' },
    update: {},
    create: {
      code: 'BTECH_CSE',
      name: 'B.Tech in Computer Science & Engineering',
      degree: 'Bachelor of Technology',
      durationYears: 4,
      departmentId: cseDept.id,
    },
  });

  const btechMech = await prisma.program.upsert({
    where: { code: 'BTECH_MECH' },
    update: {},
    create: {
      code: 'BTECH_MECH',
      name: 'B.Tech in Mechanical Engineering',
      degree: 'Bachelor of Technology',
      durationYears: 4,
      departmentId: mechDept.id,
    },
  });

  // 4. Academic Terms
  const activeTerm = await prisma.academicTerm.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000001' },
    update: { status: 'ACTIVE' },
    create: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: '2025-26 Semester 5 (Autumn)',
      academicYear: '2025-26',
      semester: 5,
      startDate: new Date('2025-07-15T00:00:00Z'),
      endDate: new Date('2025-12-15T00:00:00Z'),
      status: 'ACTIVE',
    },
  });

  const upcomingTerm = await prisma.academicTerm.upsert({
    where: { id: 'a0000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: '2025-26 Semester 6 (Spring)',
      academicYear: '2025-26',
      semester: 6,
      startDate: new Date('2026-01-05T00:00:00Z'),
      endDate: new Date('2026-05-30T00:00:00Z'),
      status: 'UPCOMING',
    },
  });

  // 5. Demo Users (3 Students, 2 Faculty, 1 Admin)
  // Student 1
  const student1 = await prisma.user.upsert({
    where: { email: 'student@demo.local' },
    update: {},
    create: {
      email: 'student@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Aarav',
          lastName: 'Deshmukh',
          prn: '202201640049281',
          phone: '+91 98765 43210',
          bio: 'Final-Year B.Tech Candidate (CSE) • Autonomous Academic Lead',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
          semester: 5,
          year: 3,
          rollNo: 'CSE-22-01',
          departmentId: cseDept.id,
          programId: btechCse.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: student1.id, roleId: studentRole.id } },
    update: {},
    create: { userId: student1.id, roleId: studentRole.id },
  });

  // Student 2
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@demo.local' },
    update: {},
    create: {
      email: 'student2@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Patel',
          prn: '202201640049282',
          phone: '+91 98765 43215',
          bio: 'Third Year B.Tech CSE • AI & Systems Enthusiast',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
          semester: 5,
          year: 3,
          rollNo: 'CSE-22-02',
          departmentId: cseDept.id,
          programId: btechCse.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: student2.id, roleId: studentRole.id } },
    update: {},
    create: { userId: student2.id, roleId: studentRole.id },
  });

  // Student 3
  const student3 = await prisma.user.upsert({
    where: { email: 'student3@demo.local' },
    update: {},
    create: {
      email: 'student3@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Rohan',
          lastName: 'Verma',
          prn: '202201640049283',
          phone: '+91 98765 43216',
          bio: 'Third Year B.Tech Mechanical • CAD & Automation Specialist',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          semester: 5,
          year: 3,
          rollNo: 'MECH-22-01',
          departmentId: mechDept.id,
          programId: btechMech.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: student3.id, roleId: studentRole.id } },
    update: {},
    create: { userId: student3.id, roleId: studentRole.id },
  });

  // Faculty 1
  const faculty1 = await prisma.user.upsert({
    where: { email: 'faculty@demo.local' },
    update: {},
    create: {
      email: 'faculty@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Dr. Rajesh',
          lastName: 'Sharma',
          prn: 'FAC-CSE-104',
          phone: '+91 98765 43211',
          bio: 'Associate Professor, Department of Computer Science & Engineering',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          departmentId: cseDept.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: faculty1.id, roleId: facultyRole.id } },
    update: {},
    create: { userId: faculty1.id, roleId: facultyRole.id },
  });

  // Faculty 2
  const faculty2 = await prisma.user.upsert({
    where: { email: 'faculty2@demo.local' },
    update: {},
    create: {
      email: 'faculty2@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Prof. Sneha',
          lastName: 'Kulkarni',
          prn: 'FAC-CSE-105',
          phone: '+91 98765 43218',
          bio: 'Assistant Professor, Algorithms & Network Architecture',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
          departmentId: cseDept.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: faculty2.id, roleId: facultyRole.id } },
    update: {},
    create: { userId: faculty2.id, roleId: facultyRole.id },
  });

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      isActive: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'Officer',
          prn: 'ADM-TGPCET-01',
          phone: '+91 98765 43212',
          bio: 'Autonomous Examination Cell & Systems Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          departmentId: cseDept.id,
        },
      },
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  // 6. Subjects (Courses)
  const subCS301 = await prisma.subject.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      code: 'CS301',
      name: 'Database Management Systems',
      description: 'Relational algebra, SQL, query indexing, transactions, ACID properties and distributed storage.',
      credits: 4,
      semester: 5,
      departmentId: cseDept.id,
      programId: btechCse.id,
    },
  });

  const subCS302 = await prisma.subject.upsert({
    where: { code: 'CS302' },
    update: {},
    create: {
      code: 'CS302',
      name: 'Design & Analysis of Algorithms',
      description: 'Asymptotic complexity, dynamic programming, divide-and-conquer, greedy algorithms and NP-completeness.',
      credits: 4,
      semester: 5,
      departmentId: cseDept.id,
      programId: btechCse.id,
    },
  });

  const subCS303 = await prisma.subject.upsert({
    where: { code: 'CS303' },
    update: {},
    create: {
      code: 'CS303',
      name: 'Computer Networks & Protocols',
      description: 'OSI/TCP-IP models, packet routing, congestion control, TLS, DNS and network sockets.',
      credits: 4,
      semester: 5,
      departmentId: cseDept.id,
      programId: btechCse.id,
    },
  });

  const subCS304 = await prisma.subject.upsert({
    where: { code: 'CS304' },
    update: {},
    create: {
      code: 'CS304',
      name: 'Software Engineering & Agile Methodologies',
      description: 'Design patterns, CI/CD, unit testing, agile sprints and system architecture modeling.',
      credits: 3,
      semester: 5,
      departmentId: cseDept.id,
      programId: btechCse.id,
    },
  });

  const subME301 = await prisma.subject.upsert({
    where: { code: 'ME301' },
    update: {},
    create: {
      code: 'ME301',
      name: 'Thermodynamics & Heat Transfer',
      description: 'First and second laws of thermodynamics, entropy, conduction, convection and radiation analysis.',
      credits: 4,
      semester: 5,
      departmentId: mechDept.id,
      programId: btechMech.id,
    },
  });

  const subME302 = await prisma.subject.upsert({
    where: { code: 'ME302' },
    update: {},
    create: {
      code: 'ME302',
      name: 'Advanced Manufacturing Processes',
      description: 'CNC machining, additive manufacturing, casting, welding and quality inspection standards.',
      credits: 4,
      semester: 5,
      departmentId: mechDept.id,
      programId: btechMech.id,
    },
  });

  // 7. Course Offerings (Semester 5 Active Offerings)
  const offCS301 = await prisma.courseOffering.upsert({
    where: { subjectId_academicTermId_sectionName: { subjectId: subCS301.id, academicTermId: activeTerm.id, sectionName: 'CSE-A' } },
    update: { facultyId: faculty1.id },
    create: {
      subjectId: subCS301.id,
      academicTermId: activeTerm.id,
      sectionName: 'CSE-A',
      facultyId: faculty1.id,
      status: 'ACTIVE',
    },
  });

  const offCS302 = await prisma.courseOffering.upsert({
    where: { subjectId_academicTermId_sectionName: { subjectId: subCS302.id, academicTermId: activeTerm.id, sectionName: 'CSE-A' } },
    update: { facultyId: faculty2.id },
    create: {
      subjectId: subCS302.id,
      academicTermId: activeTerm.id,
      sectionName: 'CSE-A',
      facultyId: faculty2.id,
      status: 'ACTIVE',
    },
  });

  const offCS303 = await prisma.courseOffering.upsert({
    where: { subjectId_academicTermId_sectionName: { subjectId: subCS303.id, academicTermId: activeTerm.id, sectionName: 'CSE-A' } },
    update: { facultyId: faculty1.id },
    create: {
      subjectId: subCS303.id,
      academicTermId: activeTerm.id,
      sectionName: 'CSE-A',
      facultyId: faculty1.id,
      status: 'ACTIVE',
    },
  });

  const offCS304 = await prisma.courseOffering.upsert({
    where: { subjectId_academicTermId_sectionName: { subjectId: subCS304.id, academicTermId: activeTerm.id, sectionName: 'CSE-A' } },
    update: { facultyId: faculty2.id },
    create: {
      subjectId: subCS304.id,
      academicTermId: activeTerm.id,
      sectionName: 'CSE-A',
      facultyId: faculty2.id,
      status: 'ACTIVE',
    },
  });

  const offME301 = await prisma.courseOffering.upsert({
    where: { subjectId_academicTermId_sectionName: { subjectId: subME301.id, academicTermId: activeTerm.id, sectionName: 'MECH-A' } },
    update: { facultyId: faculty1.id },
    create: {
      subjectId: subME301.id,
      academicTermId: activeTerm.id,
      sectionName: 'MECH-A',
      facultyId: faculty1.id,
      status: 'ACTIVE',
    },
  });

  // 8. Enrollments
  // Student 1 (Aarav) enrolled in CS301, CS302, CS303, CS304
  for (const offering of [offCS301, offCS302, offCS303, offCS304]) {
    await prisma.enrollment.upsert({
      where: { studentId_courseOfferingId: { studentId: student1.id, courseOfferingId: offering.id } },
      update: {},
      create: { studentId: student1.id, courseOfferingId: offering.id, status: 'ACTIVE' },
    });
  }

  // Student 2 (Priya) enrolled in CS301, CS302
  for (const offering of [offCS301, offCS302]) {
    await prisma.enrollment.upsert({
      where: { studentId_courseOfferingId: { studentId: student2.id, courseOfferingId: offering.id } },
      update: {},
      create: { studentId: student2.id, courseOfferingId: offering.id, status: 'ACTIVE' },
    });
  }

  // Student 3 (Rohan) enrolled in ME301
  await prisma.enrollment.upsert({
    where: { studentId_courseOfferingId: { studentId: student3.id, courseOfferingId: offME301.id } },
    update: {},
    create: { studentId: student3.id, courseOfferingId: offME301.id, status: 'ACTIVE' },
  });

  // 9. Class Schedules (Timetable)
  await prisma.classSchedule.deleteMany({});

  await prisma.classSchedule.createMany({
    data: [
      { courseOfferingId: offCS301.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: 'Room 302', building: 'Academic Block A' },
      { courseOfferingId: offCS302.id, dayOfWeek: 'MONDAY', startTime: '10:15', endTime: '11:15', room: 'Lab 4 (Systems)', building: 'Computing Hub' },
      { courseOfferingId: offCS303.id, dayOfWeek: 'MONDAY', startTime: '11:30', endTime: '12:30', room: 'Room 304', building: 'Academic Block A' },

      { courseOfferingId: offCS302.id, dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '10:00', room: 'Room 302', building: 'Academic Block A' },
      { courseOfferingId: offCS304.id, dayOfWeek: 'TUESDAY', startTime: '10:15', endTime: '11:15', room: 'Lab 2 (Software)', building: 'Computing Hub' },
      { courseOfferingId: offCS301.id, dayOfWeek: 'TUESDAY', startTime: '11:30', endTime: '12:30', room: 'Room 302', building: 'Academic Block A' },

      { courseOfferingId: offCS303.id, dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', room: 'Room 304', building: 'Academic Block A' },
      { courseOfferingId: offCS301.id, dayOfWeek: 'WEDNESDAY', startTime: '10:15', endTime: '11:15', room: 'Room 302', building: 'Academic Block A' },
      { courseOfferingId: offCS304.id, dayOfWeek: 'WEDNESDAY', startTime: '11:30', endTime: '12:30', room: 'Room 302', building: 'Academic Block A' },

      { courseOfferingId: offCS302.id, dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '10:00', room: 'Lab 4 (Systems)', building: 'Computing Hub' },
      { courseOfferingId: offCS303.id, dayOfWeek: 'THURSDAY', startTime: '10:15', endTime: '11:15', room: 'Room 304', building: 'Academic Block A' },

      { courseOfferingId: offCS301.id, dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '10:00', room: 'Room 302', building: 'Academic Block A' },
      { courseOfferingId: offCS304.id, dayOfWeek: 'FRIDAY', startTime: '10:15', endTime: '11:15', room: 'Lab 2 (Software)', building: 'Computing Hub' },

      { courseOfferingId: offME301.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: 'Room 101', building: 'Mechanical Workshop' },
      { courseOfferingId: offME301.id, dayOfWeek: 'WEDNESDAY', startTime: '10:15', endTime: '11:15', room: 'Room 101', building: 'Mechanical Workshop' },
    ],
  });

  // 10. Attendance Sessions & Records
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});

  // CS301 Sessions
  await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offCS301.id,
      facultyId: faculty1.id,
      date: new Date('2025-08-01T09:00:00Z'),
      startTime: '09:00',
      endTime: '10:00',
      topic: 'Introduction to Relational Algebra & ER Modeling',
      records: {
        create: [
          { studentId: student1.id, status: 'PRESENT' },
          { studentId: student2.id, status: 'PRESENT' },
        ],
      },
    },
  });

  await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offCS301.id,
      facultyId: faculty1.id,
      date: new Date('2025-08-05T09:00:00Z'),
      startTime: '09:00',
      endTime: '10:00',
      topic: 'SQL DDL, Constraints & Query Optimization',
      records: {
        create: [
          { studentId: student1.id, status: 'PRESENT' },
          { studentId: student2.id, status: 'LATE', remarks: 'Arrived 10 mins late' },
        ],
      },
    },
  });

  await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offCS301.id,
      facultyId: faculty1.id,
      date: new Date('2025-08-10T09:00:00Z'),
      startTime: '09:00',
      endTime: '10:00',
      topic: 'B+ Tree Indexing & Transaction Isolation Levels',
      records: {
        create: [
          { studentId: student1.id, status: 'PRESENT' },
          { studentId: student2.id, status: 'ABSENT', remarks: 'Unexcused absence' },
        ],
      },
    },
  });

  // CS302 Sessions
  await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offCS302.id,
      facultyId: faculty2.id,
      date: new Date('2025-08-02T10:15:00Z'),
      startTime: '10:15',
      endTime: '11:15',
      topic: 'Recurrence Relations & Master Theorem',
      records: {
        create: [
          { studentId: student1.id, status: 'PRESENT' },
          { studentId: student2.id, status: 'PRESENT' },
        ],
      },
    },
  });

  await prisma.attendanceSession.create({
    data: {
      courseOfferingId: offCS302.id,
      facultyId: faculty2.id,
      date: new Date('2025-08-08T10:15:00Z'),
      startTime: '10:15',
      endTime: '11:15',
      topic: 'Dynamic Programming: 0/1 Knapsack & Bellman-Ford',
      records: {
        create: [
          { studentId: student1.id, status: 'PRESENT' },
          { studentId: student2.id, status: 'PRESENT' },
        ],
      },
    },
  });

  // 11. Assignments & Submissions
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});

  await prisma.assignment.create({
    data: {
      courseOfferingId: offCS301.id,
      facultyId: faculty1.id,
      title: 'Assignment 1: Indexing & Query Optimization Benchmark',
      description: 'Analyze query execution plans (EXPLAIN ANALYZE) on a 1M row PostgreSQL table with and without B-Tree indexes. Submit execution timing comparison.',
      dueDate: new Date('2025-09-15T23:59:59Z'),
      maxMarks: 50,
      status: 'ACTIVE',
      submissions: {
        create: [
          {
            studentId: student1.id,
            content: 'Benchmark results: Sequential Scan took 284ms on unindexed table. After creating B-tree index on user_id, index scan reduced query latency to 1.4ms (99.5% improvement). Attached detailed EXPLAIN ANALYZE log in submission text.',
            submittedAt: new Date('2025-09-14T18:30:00Z'),
            marks: 48,
            feedback: 'Excellent benchmark methodology and clear latency breakdown.',
            status: 'GRADED',
          },
        ],
      },
    },
  });

  await prisma.assignment.create({
    data: {
      courseOfferingId: offCS302.id,
      facultyId: faculty2.id,
      title: 'Assignment 2: Network Flow & Dynamic Programming',
      description: 'Implement Ford-Fulkerson algorithm for Max-Flow computation and formulate Minimum Cut duality proof.',
      dueDate: new Date('2025-10-20T23:59:59Z'),
      maxMarks: 50,
      status: 'ACTIVE',
    },
  });

  await prisma.assignment.create({
    data: {
      courseOfferingId: offCS303.id,
      facultyId: faculty1.id,
      title: 'Assignment 1: TCP Congestion Control Simulation',
      description: 'Simulate TCP Reno vs TCP Cubic throughput over 50ms packet loss conditions.',
      dueDate: new Date('2025-11-01T23:59:59Z'),
      maxMarks: 100,
      status: 'ACTIVE',
    },
  });

  // 12. Exams & Exam Results
  await prisma.examResult.deleteMany({});
  await prisma.exam.deleteMany({});

  await prisma.exam.create({
    data: {
      courseOfferingId: offCS301.id,
      title: 'Mid-Semester Examination — DBMS (CS301)',
      examType: 'MIDTERM',
      date: new Date('2025-09-25T09:30:00Z'),
      startTime: '09:30',
      endTime: '11:30',
      room: 'Examination Hall 1 (Block A)',
      maxMarks: 50,
      status: 'COMPLETED',
      results: {
        create: [
          {
            studentId: student1.id,
            courseOfferingId: offCS301.id,
            marksObtained: 46,
            grade: 'A+',
            remarks: 'Exceptional performance in relational normalization and query planning.',
            status: 'PUBLISHED',
          },
          {
            studentId: student2.id,
            courseOfferingId: offCS301.id,
            marksObtained: 38,
            grade: 'B+',
            remarks: 'Good grasp of SQL DML; review concurrency control protocols.',
            status: 'PUBLISHED',
          },
        ],
      },
    },
  });

  await prisma.exam.create({
    data: {
      courseOfferingId: offCS302.id,
      title: 'Mid-Semester Examination — Algorithms (CS302)',
      examType: 'MIDTERM',
      date: new Date('2025-09-27T09:30:00Z'),
      startTime: '09:30',
      endTime: '11:30',
      room: 'Examination Hall 2 (Block A)',
      maxMarks: 50,
      status: 'COMPLETED',
      results: {
        create: [
          {
            studentId: student1.id,
            courseOfferingId: offCS302.id,
            marksObtained: 44,
            grade: 'A',
            remarks: 'Strong proof formulation in dynamic programming.',
            status: 'PUBLISHED',
          },
        ],
      },
    },
  });

  await prisma.exam.create({
    data: {
      courseOfferingId: offCS301.id,
      title: 'End-Semester Theory Examination — DBMS (CS301)',
      examType: 'END_SEMESTER',
      date: new Date('2025-12-05T10:00:00Z'),
      startTime: '10:00',
      endTime: '13:00',
      room: 'Main Auditorium (Center Wing)',
      maxMarks: 100,
      status: 'SCHEDULED',
    },
  });

  // 13. Academic Calendar Events
  await prisma.academicCalendarEvent.deleteMany({});

  await prisma.academicCalendarEvent.createMany({
    data: [
      {
        academicTermId: activeTerm.id,
        title: 'Semester 5 Classes Commence',
        description: 'First instructional day for all Autonomous B.Tech programs.',
        eventType: 'ACADEMIC',
        startDate: new Date('2025-07-15T00:00:00Z'),
        endDate: new Date('2025-07-15T23:59:59Z'),
        visibility: 'ALL',
      },
      {
        academicTermId: activeTerm.id,
        title: 'Mid-Semester Examinations Window',
        description: 'Midterm assessments for continuous internal evaluation.',
        eventType: 'EXAM',
        startDate: new Date('2025-09-22T00:00:00Z'),
        endDate: new Date('2025-09-30T23:59:59Z'),
        visibility: 'ALL',
      },
      {
        academicTermId: activeTerm.id,
        title: 'Diwali Institutional Break',
        description: 'TGPCET campus holiday break for students and faculty.',
        eventType: 'HOLIDAY',
        startDate: new Date('2025-10-28T00:00:00Z'),
        endDate: new Date('2025-11-04T23:59:59Z'),
        visibility: 'ALL',
      },
      {
        academicTermId: activeTerm.id,
        title: 'Final Project Submission Deadline',
        description: 'Final submission deadline for 5th semester lab & course mini-projects.',
        eventType: 'DEADLINE',
        startDate: new Date('2025-11-20T00:00:00Z'),
        endDate: new Date('2025-11-20T23:59:59Z'),
        visibility: 'STUDENT',
      },
      {
        academicTermId: activeTerm.id,
        title: 'End-Semester Autonomous Examinations',
        description: 'Final theory and practical examinations for Autumn 2025-26.',
        eventType: 'EXAM',
        startDate: new Date('2025-12-01T00:00:00Z'),
        endDate: new Date('2025-12-15T23:59:59Z'),
        visibility: 'ALL',
      },
      {
        academicTermId: upcomingTerm.id,
        title: 'Semester 6 (Spring) Orientation & Registration',
        description: 'Course registration opens for 6th semester elective subjects.',
        eventType: 'ACADEMIC',
        startDate: new Date('2026-01-05T00:00:00Z'),
        endDate: new Date('2026-01-08T23:59:59Z'),
        visibility: 'ALL',
      },
    ],
  });

  // ==========================================
  // PHASE 3: CAMPUS SPATIAL CORE & WAYFINDING SEEDING
  // ==========================================
  console.log('🗺️ Seeding Phase 3 Campus Spatial Core & Map data...');

  // 1. Campus Entity (Clearly marked Demo Spatial Data for TGPCET)
  const tgpcetCampus = await prisma.campus.upsert({
    where: { code: 'TGPCET_MOHGAON_MAIN' },
    update: {},
    create: {
      code: 'TGPCET_MOHGAON_MAIN',
      name: 'TGPCET Main Campus (Mohgaon)',
      description: 'Tulsiramji Gaikwad-Patil College of Engineering and Technology (Autonomous), Nagpur. DEMO spatial dataset for campus navigation and wayfinding.',
      address: 'Mohgaon, Wardha Road, Nagpur, Maharashtra 441108',
      latitude: 21.0118,
      longitude: 79.0275,
      boundary: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0250, 21.0100],
            [79.0300, 21.0100],
            [79.0300, 21.0150],
            [79.0250, 21.0150],
            [79.0250, 21.0100],
          ],
        ],
      },
      status: 'ACTIVE',
    },
  });

  // 2. Location Categories
  const categoriesData = [
    { code: 'ACADEMIC', name: 'Academic Blocks & Labs', icon: 'BookOpen', displayOrder: 1 },
    { code: 'ADMINISTRATION', name: 'Administrative Offices', icon: 'Building2', displayOrder: 2 },
    { code: 'LIBRARY', name: 'Library & Knowledge Hub', icon: 'Library', displayOrder: 3 },
    { code: 'FOOD', name: 'Cafeteria & Dining', icon: 'Utensils', displayOrder: 4 },
    { code: 'FACILITY', name: 'Campus Utilities & Services', icon: 'Sparkles', displayOrder: 5 },
    { code: 'SPORTS', name: 'Sports & Gymnasium', icon: 'Trophy', displayOrder: 6 },
    { code: 'AUDITORIUM', name: 'Auditoriums & Seminar Halls', icon: 'Presentation', displayOrder: 7 },
    { code: 'PARKING', name: 'Vehicle Parking Lots', icon: 'Car', displayOrder: 8 },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.locationCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
    catMap.set(cat.code, record.id);
  }

  // 3. Facilities
  const facilitiesData = [
    { code: 'WIFI', name: 'High-Speed Campus Wi-Fi', description: 'Institutional fiber network coverage', icon: 'Wifi' },
    { code: 'WASHROOM', name: 'Restrooms & Washrooms', description: 'Clean sanitised gender-separated restrooms', icon: 'Bath' },
    { code: 'DRINKING_WATER', name: 'Purified RO Drinking Water', description: 'Cold and ambient RO water dispensers', icon: 'Droplets' },
    { code: 'PARKING', name: 'Vehicle Parking', description: 'Designated 2-wheeler and 4-wheeler spots', icon: 'Car' },
    { code: 'ACCESSIBLE_ENTRANCE', name: 'Wheelchair Accessible Ramp', description: 'Barrier-free ramp with handrails', icon: 'Accessibility' },
    { code: 'MEDICAL', name: 'First Aid & Health Center', description: 'Medical emergency equipment & nursing desk', icon: 'HeartPulse' },
    { code: 'FOOD', name: 'Cafeteria & Food Court', description: 'Hygienic meals, snacks, and beverages', icon: 'Coffee' },
    { code: 'PRINTING', name: 'Stationery & Reprography', description: 'Photocopying, printing, and binding', icon: 'Printer' },
    { code: 'STUDY_AREA', name: 'Quiet Study & Digital Zone', description: 'Silent reading and project discussion spaces', icon: 'BookMarked' },
  ];

  const facMap = new Map<string, string>();
  for (const fac of facilitiesData) {
    const record = await prisma.facility.upsert({
      where: { code: fac.code },
      update: {},
      create: fac,
    });
    facMap.set(fac.code, record.id);
  }

  // 4. Buildings (5+ Buildings with realistic footprints)
  const buildingsData = [
    {
      code: 'BLD_ADMIN',
      name: 'Administrative Complex',
      description: 'Principal office, Registrar secretariat, Student Accounts, Admissions, and Examination Cell.',
      buildingType: 'ADMINISTRATIVE',
      latitude: 21.0125,
      longitude: 79.0270,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0267, 21.0122],
            [79.0273, 21.0122],
            [79.0273, 21.0128],
            [79.0267, 21.0128],
            [79.0267, 21.0122],
          ],
        ],
      },
    },
    {
      code: 'BLD_ACAD_A',
      name: 'Academic Block A (CSE, IT & Emerging Tech)',
      description: '4-story academic wing housing Computer Science, IT laboratories, smart classrooms, and faculty cabins.',
      buildingType: 'ACADEMIC',
      latitude: 21.0130,
      longitude: 79.0280,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0276, 21.0126],
            [79.0284, 21.0126],
            [79.0284, 21.0134],
            [79.0276, 21.0134],
            [79.0276, 21.0126],
          ],
        ],
      },
    },
    {
      code: 'BLD_ACAD_B',
      name: 'Academic Block B (Mechanical, Civil & Electrical)',
      description: 'Engineering workshops, CAD/CAM labs, fluid mechanics setups, and departmental classrooms.',
      buildingType: 'ACADEMIC',
      latitude: 21.0115,
      longitude: 79.0285,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0281, 21.0111],
            [79.0289, 21.0111],
            [79.0289, 21.0119],
            [79.0281, 21.0119],
            [79.0281, 21.0111],
          ],
        ],
      },
    },
    {
      code: 'BLD_LIB',
      name: 'Central Library & Innovation Center',
      description: '2-tier knowledge hub with 40,000+ volumes, IEEE digital access, and Incubation center.',
      buildingType: 'LIBRARY',
      latitude: 21.0120,
      longitude: 79.0262,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0258, 21.0116],
            [79.0266, 21.0116],
            [79.0266, 21.0124],
            [79.0258, 21.0124],
            [79.0258, 21.0116],
          ],
        ],
      },
    },
    {
      code: 'BLD_CANTEEN',
      name: 'Central Canteen & Student Hub',
      description: 'Spacious multi-cuisine food court, outdoor shaded seating, and Student Activity Council lounge.',
      buildingType: 'CANTEEN',
      latitude: 21.0108,
      longitude: 79.0272,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0268, 21.0104],
            [79.0276, 21.0104],
            [79.0276, 21.0112],
            [79.0268, 21.0112],
            [79.0268, 21.0104],
          ],
        ],
      },
    },
    {
      code: 'BLD_AUDITORIUM',
      name: 'Dr. APJ Abdul Kalam Auditorium Complex',
      description: '800-seater acoustic auditorium for national conferences, cultural fests, and expert conclaves.',
      buildingType: 'AUDITORIUM',
      latitude: 21.0138,
      longitude: 79.0262,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.0257, 21.0134],
            [79.0267, 21.0134],
            [79.0267, 21.0142],
            [79.0257, 21.0142],
            [79.0257, 21.0134],
          ],
        ],
      },
    },
  ];

  const bldMap = new Map<string, any>();
  for (const bld of buildingsData) {
    const record = await prisma.building.upsert({
      where: { code: bld.code },
      update: {},
      create: {
        ...bld,
        campusId: tgpcetCampus.id,
      },
    });
    bldMap.set(bld.code, record);

    // Link facilities to building
    const bldFacs = ['WIFI', 'DRINKING_WATER', 'WASHROOM', 'ACCESSIBLE_ENTRANCE'];
    for (const fCode of bldFacs) {
      const fId = facMap.get(fCode);
      if (fId) {
        await prisma.buildingFacility.upsert({
          where: { buildingId_facilityId: { buildingId: record.id, facilityId: fId } },
          update: {},
          create: { buildingId: record.id, facilityId: fId },
        });
      }
    }
  }

  // 5. Floors & Rooms
  // Block A Floors
  const blockA = bldMap.get('BLD_ACAD_A');
  const floorA0 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: blockA.id, floorNumber: 0 } },
    update: {},
    create: { buildingId: blockA.id, name: 'Ground Floor', floorNumber: 0, displayOrder: 0 },
  });
  const floorA1 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: blockA.id, floorNumber: 1 } },
    update: {},
    create: { buildingId: blockA.id, name: 'First Floor', floorNumber: 1, displayOrder: 1 },
  });
  const floorA2 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: blockA.id, floorNumber: 2 } },
    update: {},
    create: { buildingId: blockA.id, name: 'Second Floor', floorNumber: 2, displayOrder: 2 },
  });

  // Library Floors
  const libraryBld = bldMap.get('BLD_LIB');
  const floorLib0 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: libraryBld.id, floorNumber: 0 } },
    update: {},
    create: { buildingId: libraryBld.id, name: 'Ground Floor', floorNumber: 0, displayOrder: 0 },
  });

  // Admin Floors
  const adminBld = bldMap.get('BLD_ADMIN');
  const floorAdm0 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: adminBld.id, floorNumber: 0 } },
    update: {},
    create: { buildingId: adminBld.id, name: 'Ground Floor', floorNumber: 0, displayOrder: 0 },
  });
  const floorAdm1 = await prisma.floor.upsert({
    where: { buildingId_floorNumber: { buildingId: adminBld.id, floorNumber: 1 } },
    update: {},
    create: { buildingId: adminBld.id, name: 'First Floor', floorNumber: 1, displayOrder: 1 },
  });

  // Rooms (10+ structured rooms)
  const roomA101 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorA0.id, roomNumber: '101' } },
    update: {},
    create: {
      floorId: floorA0.id,
      roomNumber: '101',
      name: 'Smart Interactive Classroom 101',
      roomType: 'CLASSROOM',
      capacity: 70,
      departmentId: cseDept.id,
      description: 'Audio-visual enabled smart classroom with projector and recording facility.',
      latitude: 21.0129,
      longitude: 79.0278,
    },
  });

  const roomA102 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorA0.id, roomNumber: '102' } },
    update: {},
    create: {
      floorId: floorA0.id,
      roomNumber: '102',
      name: 'Advanced Computing & AI Lab',
      roomType: 'LAB',
      capacity: 45,
      departmentId: cseDept.id,
      description: 'Equipped with high-performance GPU workstations for machine learning and research.',
      latitude: 21.0131,
      longitude: 79.0282,
    },
  });

  const roomA201 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorA1.id, roomNumber: '201' } },
    update: {},
    create: {
      floorId: floorA1.id,
      roomNumber: '201',
      name: 'Software Engineering & Web Lab',
      roomType: 'LAB',
      capacity: 40,
      departmentId: cseDept.id,
      description: 'Development environment for fullstack software systems and cloud labs.',
    },
  });

  const roomA205 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorA1.id, roomNumber: '205' } },
    update: {},
    create: {
      floorId: floorA1.id,
      roomNumber: '205',
      name: 'CSE Department Office & HOD Cabin',
      roomType: 'FACULTY_ROOM',
      capacity: 12,
      departmentId: cseDept.id,
      description: 'Head of Computer Science & Engineering department consultation office.',
    },
  });

  const roomA301 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorA2.id, roomNumber: '301' } },
    update: {},
    create: {
      floorId: floorA2.id,
      roomNumber: '301',
      name: 'Seminar Hall A',
      roomType: 'SEMINAR_HALL',
      capacity: 150,
      departmentId: cseDept.id,
      description: 'Departmental seminar hall for project reviews and technical workshops.',
    },
  });

  const roomLib01 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorLib0.id, roomNumber: 'LIB-G01' } },
    update: {},
    create: {
      floorId: floorLib0.id,
      roomNumber: 'LIB-G01',
      name: 'Digital Reference Section',
      roomType: 'OTHER',
      capacity: 120,
      description: 'Central book stacks, e-journal terminals, and silent study cubicles.',
    },
  });

  const roomAdm101 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorAdm0.id, roomNumber: 'ADM-01' } },
    update: {},
    create: {
      floorId: floorAdm0.id,
      roomNumber: 'ADM-01',
      name: 'Student Welfare & Admissions Desk',
      roomType: 'OFFICE',
      capacity: 25,
      description: 'Inquiry desk, fee payment verification, and scholarship document submission.',
    },
  });

  const roomAdm201 = await prisma.room.upsert({
    where: { floorId_roomNumber: { floorId: floorAdm1.id, roomNumber: 'ADM-201' } },
    update: {},
    create: {
      floorId: floorAdm1.id,
      roomNumber: 'ADM-201',
      name: 'Principal Secretariat',
      roomType: 'OFFICE',
      capacity: 15,
      description: 'Office of the Principal and Autonomous Academic Council.',
    },
  });

  // 6. Entrances
  const entrancesData = [
    {
      buildingId: blockA.id,
      name: 'Academic Block A - Main Portico Entry',
      latitude: 21.0127,
      longitude: 79.0278,
      type: 'MAIN',
      accessibilityStatus: true,
    },
    {
      buildingId: blockA.id,
      name: 'Academic Block A - North Wheelchair Ramp',
      latitude: 21.0133,
      longitude: 79.0277,
      type: 'ACCESSIBLE',
      accessibilityStatus: true,
    },
    {
      buildingId: adminBld.id,
      name: 'Administrative Complex - Grand Entrance',
      latitude: 21.0123,
      longitude: 79.0270,
      type: 'MAIN',
      accessibilityStatus: true,
    },
    {
      buildingId: libraryBld.id,
      name: 'Central Library - Front Arch Entrance',
      latitude: 21.0118,
      longitude: 79.0264,
      type: 'MAIN',
      accessibilityStatus: true,
    },
    {
      buildingId: bldMap.get('BLD_CANTEEN').id,
      name: 'Canteen - East Walkway Entry',
      latitude: 21.0109,
      longitude: 79.0274,
      type: 'MAIN',
      accessibilityStatus: true,
    },
  ];

  for (const ent of entrancesData) {
    await prisma.entrance.create({
      data: ent,
    });
  }

  // 7. Campus Places (12+ Searchable locations)
  const placesData = [
    {
      name: 'Central Library & Digital Hub',
      slug: 'central-library',
      description: 'Autonomous central repository with over 40,000 technical titles, digital kiosk terminals, and peaceful reading halls.',
      categoryCode: 'LIBRARY',
      buildingCode: 'BLD_LIB',
      roomId: roomLib01.id,
      latitude: 21.0120,
      longitude: 79.0262,
      phone: '+91 712 280 1024',
      email: 'library@tgpcet.edu.in',
      website: 'https://tgpcet.edu.in/library',
      facilities: ['WIFI', 'STUDY_AREA', 'PRINTING', 'DRINKING_WATER', 'ACCESSIBLE_ENTRANCE'],
    },
    {
      name: 'TGPCET Central Cafeteria',
      slug: 'main-cafeteria',
      description: 'Vibrant dining destination serving fresh vegetarian & nutritious meals, freshly brewed coffee, and snacks.',
      categoryCode: 'FOOD',
      buildingCode: 'BLD_CANTEEN',
      latitude: 21.0108,
      longitude: 79.0272,
      phone: '+91 712 280 1099',
      facilities: ['FOOD', 'DRINKING_WATER', 'WASHROOM', 'WIFI'],
    },
    {
      name: 'Principal Secretariat & Autonomous Board Room',
      slug: 'principal-office',
      description: 'Executive governance center of TGPCET, office of the Principal, and Autonomous Academic Council meeting hall.',
      categoryCode: 'ADMINISTRATION',
      buildingCode: 'BLD_ADMIN',
      roomId: roomAdm201.id,
      latitude: 21.0126,
      longitude: 79.0271,
      phone: '+91 712 280 1001',
      email: 'principal@tgpcet.edu.in',
      facilities: ['WIFI', 'ACCESSIBLE_ENTRANCE'],
    },
    {
      name: 'Department of Computer Science & Engineering',
      slug: 'cse-department-office',
      description: 'Departmental headquarters, faculty discussion bays, curriculum coordination, and academic mentoring desk.',
      categoryCode: 'ACADEMIC',
      buildingCode: 'BLD_ACAD_A',
      roomId: roomA205.id,
      latitude: 21.0130,
      longitude: 79.0280,
      phone: '+91 712 280 1030',
      email: 'cse.dept@tgpcet.edu.in',
      facilities: ['WIFI', 'WASHROOM', 'DRINKING_WATER'],
    },
    {
      name: 'Advanced Computing & AI Laboratory',
      slug: 'ai-computing-lab',
      description: 'Cutting-edge computational research facility equipped with NVIDIA RTX GPUs and cloud development stations.',
      categoryCode: 'ACADEMIC',
      buildingCode: 'BLD_ACAD_A',
      roomId: roomA102.id,
      latitude: 21.0131,
      longitude: 79.0282,
      facilities: ['WIFI', 'STUDY_AREA'],
    },
    {
      name: 'Student Welfare & Admission Facilitation Cell',
      slug: 'student-welfare-cell',
      description: 'Dedicated single-window center for admissions, scholarship verifications, bus passes, and general student aid.',
      categoryCode: 'ADMINISTRATION',
      buildingCode: 'BLD_ADMIN',
      roomId: roomAdm101.id,
      latitude: 21.0124,
      longitude: 79.0269,
      phone: '+91 712 280 1010',
      email: 'admissions@tgpcet.edu.in',
      facilities: ['WIFI', 'ACCESSIBLE_ENTRANCE', 'DRINKING_WATER'],
    },
    {
      name: 'Autonomous Examination Control Division',
      slug: 'examination-control-cell',
      description: 'Confidential examination planning, evaluation processing, marksheet distribution, and grade card issuance.',
      categoryCode: 'ADMINISTRATION',
      buildingCode: 'BLD_ADMIN',
      latitude: 21.0127,
      longitude: 79.0272,
      phone: '+91 712 280 1015',
      email: 'coe@tgpcet.edu.in',
      facilities: ['WIFI'],
    },
    {
      name: 'TGPCET Incubation & Innovation Hub',
      slug: 'innovation-hub',
      description: 'Maker space with 3D printers, IoT kits, and mentoring support for student startup ventures and patents.',
      categoryCode: 'FACILITY',
      buildingCode: 'BLD_LIB',
      latitude: 21.0122,
      longitude: 79.0260,
      facilities: ['WIFI', 'PRINTING', 'STUDY_AREA'],
    },
    {
      name: 'Main Sports Complex & Athletics Ground',
      slug: 'sports-ground',
      description: 'Standard outdoor cricket ground, basketball court, volleyball arena, and 400m running track.',
      categoryCode: 'SPORTS',
      latitude: 21.0142,
      longitude: 79.0290,
      facilities: ['DRINKING_WATER', 'WASHROOM'],
    },
    {
      name: 'Dr. APJ Abdul Kalam Auditorium',
      slug: 'auditorium',
      description: 'Grand air-conditioned auditorium with theatrical sound and lighting systems for convocations and symposiums.',
      categoryCode: 'AUDITORIUM',
      buildingCode: 'BLD_AUDITORIUM',
      latitude: 21.0138,
      longitude: 79.0262,
      facilities: ['ACCESSIBLE_ENTRANCE', 'WASHROOM', 'WIFI'],
    },
    {
      name: 'Campus First Aid & Health Center',
      slug: 'medical-room',
      description: 'Equipped medical bay with registered campus nurse, ambulance tie-up, and emergency first aid supplies.',
      categoryCode: 'FACILITY',
      buildingCode: 'BLD_ADMIN',
      latitude: 21.0123,
      longitude: 79.0268,
      phone: '+91 712 280 1008',
      facilities: ['MEDICAL', 'ACCESSIBLE_ENTRANCE'],
    },
    {
      name: 'North Campus Parking Facility',
      slug: 'north-parking',
      description: 'Secured shade-covered parking area with 24/7 CCTV surveillance for 2-wheelers and staff automobiles.',
      categoryCode: 'PARKING',
      latitude: 21.0145,
      longitude: 79.0270,
      facilities: ['PARKING'],
    },
  ];

  for (const pl of placesData) {
    const catId = catMap.get(pl.categoryCode) || catMap.get('ACADEMIC')!;
    const bldRecord = pl.buildingCode ? bldMap.get(pl.buildingCode) : null;

    const placeRecord = await prisma.campusPlace.upsert({
      where: { slug: pl.slug },
      update: {},
      create: {
        campusId: tgpcetCampus.id,
        name: pl.name,
        slug: pl.slug,
        description: pl.description,
        categoryId: catId,
        buildingId: bldRecord ? bldRecord.id : null,
        roomId: pl.roomId || null,
        latitude: pl.latitude,
        longitude: pl.longitude,
        phone: pl.phone,
        email: pl.email,
        website: pl.website,
        status: 'ACTIVE',
      },
    });

    // Link place facilities
    if (pl.facilities) {
      for (const fCode of pl.facilities) {
        const fId = facMap.get(fCode);
        if (fId) {
          await prisma.placeFacility.upsert({
            where: { placeId_facilityId: { placeId: placeRecord.id, facilityId: fId } },
            update: {},
            create: { placeId: placeRecord.id, facilityId: fId },
          });
        }
      }
    }

    // Attach sample photo metadata
    await prisma.locationImage.create({
      data: {
        placeId: placeRecord.id,
        buildingId: bldRecord ? bldRecord.id : null,
        url: `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80`,
        altText: `${pl.name} photographic view`,
        caption: `Exterior and facility view of ${pl.name} at TGPCET Campus.`,
        sortOrder: 0,
      },
    });
  }

  // 8. Campus Walking Paths Network (Path Graph for Wayfinding)
  const pathsData = [
    {
      name: 'Main Gate to Administrative Plaza',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'PAVED',
      lengthMeters: 120,
      startNode: 'MAIN_GATE',
      endNode: 'ADMIN_PLAZA',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0270, 21.0102],
          [79.0270, 21.0112],
          [79.0270, 21.0123],
        ],
      },
    },
    {
      name: 'Administrative Plaza to Central Library Avenue',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'TILES',
      lengthMeters: 90,
      startNode: 'ADMIN_PLAZA',
      endNode: 'LIBRARY_WEST',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0270, 21.0123],
          [79.0265, 21.0120],
          [79.0262, 21.0120],
        ],
      },
    },
    {
      name: 'Administrative Plaza to Academic Block A Walkway',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'CONCRETE',
      lengthMeters: 110,
      startNode: 'ADMIN_PLAZA',
      endNode: 'ACAD_A_PORTICO',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0270, 21.0123],
          [79.0275, 21.0125],
          [79.0278, 21.0127],
          [79.0280, 21.0130],
        ],
      },
    },
    {
      name: 'Academic Block A to Academic Block B Connector',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'PAVED',
      lengthMeters: 170,
      startNode: 'ACAD_A_PORTICO',
      endNode: 'ACAD_B_ENTRY',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0280, 21.0130],
          [79.0282, 21.0122],
          [79.0285, 21.0115],
        ],
      },
    },
    {
      name: 'Library to Auditorium Promenade',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'TILES',
      lengthMeters: 180,
      startNode: 'LIBRARY_WEST',
      endNode: 'AUDITORIUM_ENTRY',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0262, 21.0120],
          [79.0262, 21.0128],
          [79.0262, 21.0138],
        ],
      },
    },
    {
      name: 'Auditorium to Academic Block A Crosswalk',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'CONCRETE',
      lengthMeters: 195,
      startNode: 'AUDITORIUM_ENTRY',
      endNode: 'ACAD_A_PORTICO',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0262, 21.0138],
          [79.0270, 21.0135],
          [79.0278, 21.0130],
          [79.0280, 21.0130],
        ],
      },
    },
    {
      name: 'Central Canteen to Admin Plaza Path',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'PAVED',
      lengthMeters: 160,
      startNode: 'CANTEEN_ENTRY',
      endNode: 'ADMIN_PLAZA',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0272, 21.0108],
          [79.0271, 21.0115],
          [79.0270, 21.0123],
        ],
      },
    },
    {
      name: 'Academic Block A to Sports Ground Pathway',
      pathType: 'WALKWAY',
      accessible: true,
      surface: 'ASPHALT',
      lengthMeters: 175,
      startNode: 'ACAD_A_PORTICO',
      endNode: 'SPORTS_GROUND',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0280, 21.0130],
          [79.0285, 21.0136],
          [79.0290, 21.0142],
        ],
      },
    },
    {
      name: 'Library Stepped Terrace Shortcut (Inaccessible Stairs)',
      pathType: 'STAIRS',
      accessible: false,
      surface: 'STEPS',
      lengthMeters: 45,
      startNode: 'LIBRARY_WEST',
      endNode: 'ADMIN_PLAZA',
      geometry: {
        type: 'LineString',
        coordinates: [
          [79.0262, 21.0120],
          [79.0266, 21.0121],
          [79.0270, 21.0123],
        ],
      },
    },
  ];

  for (const p of pathsData) {
    await prisma.campusPath.create({
      data: {
        campusId: tgpcetCampus.id,
        name: p.name,
        pathType: p.pathType,
        accessible: p.accessible,
        surface: p.surface,
        lengthMeters: p.lengthMeters,
        startNode: p.startNode,
        endNode: p.endNode,
        geometry: p.geometry,
      },
    });
  }

  // ==========================================
  // PHASE 4: CAMPUS SERVICES & ENGAGEMENT SEED
  // ==========================================
  console.log('🌱 Seeding Phase 4 Campus Services & Engagement...');

  // 1. Service Categories
  const serviceCategories = [
    { code: 'ELECTRICAL', name: 'Electrical & Power', icon: 'zap', description: 'Lights, fans, switchboards, and power outlets', displayOrder: 1 },
    { code: 'PROJECTOR', name: 'Projectors & AV', icon: 'video', description: 'Classroom projectors, audio systems, smart podiums', displayOrder: 2 },
    { code: 'WIFI', name: 'Wi-Fi & Network', icon: 'wifi', description: 'Campus Wi-Fi connectivity, LAN ports, and speed issues', displayOrder: 3 },
    { code: 'CLEANLINESS', name: 'Housekeeping & Cleanliness', icon: 'sparkles', description: 'Classroom, lab, corridor, and washroom sanitation', displayOrder: 4 },
    { code: 'WATER', name: 'Drinking Water & Plumbing', icon: 'droplet', description: 'Water coolers, purifiers, tap leakage, and plumbing', displayOrder: 5 },
    { code: 'FURNITURE', name: 'Furniture & Fixtures', icon: 'armchair', description: 'Benches, chairs, lecture podiums, and lab tables', displayOrder: 6 },
    { code: 'INFRASTRUCTURE', name: 'Infrastructure & Civil', icon: 'tool', description: 'Doors, windows, painting, tiles, and civil repairs', displayOrder: 7 },
    { code: 'GENERAL', name: 'General Campus Services', icon: 'help-circle', description: 'General inquiries and campus utility assistance', displayOrder: 8 },
  ];

  for (const cat of serviceCategories) {
    await prisma.serviceCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }

  // 2. Demo Notices (10 notices across categories and priorities)
  const noticesData = [
    {
      title: 'Autonomous End-Semester Examination Schedule Announced',
      summary: 'Winter 2025 Autonomous examination timetable released for all undergraduate B.Tech programs.',
      content: 'All students are hereby informed that the Autonomous End-Semester Examination timetable for Winter 2025 has been published on the student portal. Practical examinations commence from 10th November 2025, followed by theory papers from 22nd November 2025. Hall tickets will be available for download 7 days prior.',
      category: 'EXAM',
      priority: 'URGENT',
      audience: 'STUDENT',
      departmentId: cseDept.id,
      publishedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      title: 'Annual Technical Symposium: TechFest 2025 Registrations Open',
      summary: 'Central India flagship technical festival calling for project presentations, robotics competitions, and hackathons.',
      content: 'TGPCET announces TechFest 2025 with prize pool exceeding 2.5 Lakhs! Flagship events include Code-A-Thon 3.0, RoboRace, AI Hack-Sprint, and Autonomous Drone Design. Register via the Campus 360 Events module before 15th November 2025.',
      category: 'ACADEMIC',
      priority: 'IMPORTANT',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      title: 'Central Library Extended Study Hours during Examination Period',
      summary: 'Central Library reading hall will remain open until 10:00 PM on all working days and Saturdays.',
      content: 'In view of upcoming semester examinations, the Central Library reading halls and digital knowledge center will operate with extended hours from 8:00 AM to 10:00 PM daily. Students must carry their valid institute ID cards.',
      category: 'ADMINISTRATIVE',
      priority: 'NORMAL',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      title: 'Campus Wi-Fi Maintenance Window Notice',
      summary: 'Core fiber network maintenance scheduled on Sunday between 02:00 AM and 06:00 AM.',
      content: 'Please note that institutional Wi-Fi and server connectivity will experience intermittent downtime during the scheduled maintenance window on Sunday. Normal connectivity will resume by 06:30 AM.',
      category: 'GENERAL',
      priority: 'NORMAL',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 7 * 86400000),
    },
    {
      title: 'Mandatory Submission of Semester 5 Mini-Project Reports',
      summary: 'All CSE Semester 5 students must submit verified mini-project documentation to respective faculty guides.',
      content: 'Submission deadline for Semester 5 Mini-Project documentation, Git repositories, and faculty evaluation rubrics is 5th November 2025. Late submissions will result in grade penalties.',
      category: 'DEPARTMENT',
      priority: 'IMPORTANT',
      audience: 'STUDENT',
      departmentId: cseDept.id,
      publishedAt: new Date(Date.now() - 8 * 86400000),
    },
    {
      title: 'Faculty Development Program on Generative AI & Autonomous Computing',
      summary: '5-Day national level FDP organized in association with ISTE and industry partners.',
      content: 'All faculty members are invited to participate in the one-week FDP focusing on prompt engineering, deep learning infrastructure, and student AI mentorship starting 18th November 2025 in Seminar Hall B-201.',
      category: 'ACADEMIC',
      priority: 'NORMAL',
      audience: 'FACULTY',
      publishedAt: new Date(Date.now() - 10 * 86400000),
    },
    {
      title: 'Emergency Mock Fire Drill & Evacuation Safety Exercise',
      summary: 'Scheduled mock evacuation drill across Academic Blocks A & B on Wednesday at 11:30 AM.',
      content: 'An institutional fire safety exercise will be conducted in coordination with the local Disaster Response team. All occupants must calmly follow floor wardens to the central sports ground assembly zone.',
      category: 'EMERGENCY',
      priority: 'URGENT',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      title: 'Campus Green Initiative: Tree Plantation Drive',
      summary: 'NSS & Environmental Club organizing plantation drive around the sports arena.',
      content: 'Join hands to plant 500 indigenous trees across the campus perimeter. Volunteers will receive participation certificates and refreshment coupons.',
      category: 'GENERAL',
      priority: 'NORMAL',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 12 * 86400000),
    },
    {
      title: 'Industrial Visit to Nagpur Multi-Modal Logistics & IT Corridor',
      summary: 'One-day educational excursion for Mechanical and Computer Engineering students.',
      content: 'Students with minimum 75% attendance are eligible to register with their respective department coordinators by Friday.',
      category: 'DEPARTMENT',
      priority: 'NORMAL',
      audience: 'STUDENT',
      publishedAt: new Date(Date.now() - 14 * 86400000),
    },
    {
      title: 'Institutional Grievance Redressal Cell Meeting Schedule',
      summary: 'Quarterly open forum for student and staff feedback in Conference Room A-102.',
      content: 'The Autonomous Institutional Grievance Redressal Committee will convene on the first Monday of the month. Submissions may be submitted in advance via the Campus 360 Feedback portal.',
      category: 'ADMINISTRATIVE',
      priority: 'NORMAL',
      audience: 'ALL',
      publishedAt: new Date(Date.now() - 15 * 86400000),
    },
  ];

  for (const n of noticesData) {
    await prisma.notice.create({
      data: {
        ...n,
        authorId: adminUser.id,
      },
    });
  }

  // 3. Demo Clubs (5 clubs)
  const clubsData = [
    {
      name: 'Coding & Open Source Community (COSC)',
      slug: 'cosc-tgpcet',
      description: 'The premier student developer club dedicated to competitive programming, hackathons, open source contributions, and web engineering.',
      category: 'TECHNICAL',
      departmentId: cseDept.id,
      createdBy: student1.id,
    },
    {
      name: 'Robotics & Automation Society (RAS)',
      slug: 'ras-robotics',
      description: 'Hands-on engineering hub building autonomous rovers, combat bots, drones, and industrial IoT prototypes.',
      category: 'TECHNICAL',
      departmentId: mechDept.id,
      createdBy: student1.id,
    },
    {
      name: 'Spandan Cultural Society',
      slug: 'spandan-cultural',
      description: 'Vibrant cultural platform for music, dance, theatrical arts, and annual cultural fest organizing committees.',
      category: 'CULTURAL',
      createdBy: student1.id,
    },
    {
      name: 'TGPCET Sports Club & Athletics',
      slug: 'tgpcet-sports',
      description: 'Promoting inter-collegiate cricket, football, basketball, badminton, and annual sports tournaments.',
      category: 'SPORTS',
      createdBy: student1.id,
    },
    {
      name: 'Literary & Debating Guild',
      slug: 'literary-guild',
      description: 'Fostering public speaking, parliamentary debates, creative writing, and campus newsletter publication.',
      category: 'ACADEMIC',
      createdBy: student1.id,
    },
  ];

  const createdClubs = [];
  for (const c of clubsData) {
    const club = await prisma.club.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    createdClubs.push(club);

    // Add student1 as member/lead
    await prisma.clubMembership.upsert({
      where: {
        clubId_userId: { clubId: club.id, userId: student1.id },
      },
      update: {},
      create: {
        clubId: club.id,
        userId: student1.id,
        role: 'LEAD',
        status: 'ACTIVE',
      },
    });
  }

  // 4. Demo Events (8 events)
  const eventsData = [
    {
      title: 'Code-A-Thon 2025: Autonomous 24-Hour Hackathon',
      description: 'Build innovative real-world software solutions across AI, Web3, Smart Campus, and EdTech. Food, mentorship, and high-speed Wi-Fi provided.',
      category: 'TECHNICAL',
      startDateTime: new Date(Date.now() + 5 * 86400000),
      endDateTime: new Date(Date.now() + 6 * 86400000),
      venue: 'Computer Center & Lab A-101',
      capacity: 120,
      registrationRequired: true,
      organizerId: faculty1.id,
    },
    {
      title: 'Hands-on Drone & Quadcopter Workshop',
      description: 'Learn aerodynamics, flight controllers, ESC tuning, and live drone piloting on the sports ground.',
      category: 'WORKSHOP',
      startDateTime: new Date(Date.now() + 8 * 86400000),
      endDateTime: new Date(Date.now() + 8 * 86400000 + 4 * 3600000),
      venue: 'Robotics Center Lab B-002',
      capacity: 60,
      registrationRequired: true,
      organizerId: faculty2.id,
    },
    {
      title: 'Inter-Department Cricket Tournament 2025',
      description: 'Annual 10-over floodlight cricket tournament featuring 12 departmental teams.',
      category: 'SPORTS',
      startDateTime: new Date(Date.now() + 12 * 86400000),
      endDateTime: new Date(Date.now() + 15 * 86400000),
      venue: 'Main Sports Complex & Cricket Oval',
      capacity: 300,
      registrationRequired: false,
      organizerId: adminUser.id,
    },
    {
      title: 'Spandan Acoustic Musical Evening',
      description: 'Live acoustic unplugged performances by college bands, solo artists, and beatboxers.',
      category: 'CULTURAL',
      startDateTime: new Date(Date.now() + 10 * 86400000),
      endDateTime: new Date(Date.now() + 10 * 86400000 + 3 * 3600000),
      venue: 'Auditorium Open Amphitheater',
      capacity: 250,
      registrationRequired: true,
      organizerId: student1.id,
    },
    {
      title: 'Seminar on Career Opportunities in Cloud Architecture & DevOps',
      description: 'Keynote by industry senior architects from leading tech giants on Kubernetes, AWS, and modern CI/CD pipelines.',
      category: 'SEMINAR',
      startDateTime: new Date(Date.now() + 14 * 86400000),
      endDateTime: new Date(Date.now() + 14 * 86400000 + 2 * 3600000),
      venue: 'Central Seminar Hall A-201',
      capacity: 150,
      registrationRequired: true,
      organizerId: faculty1.id,
    },
    {
      title: 'Robotics Line Follower Challenge',
      description: 'Competitive maze runner and high-speed line tracking challenge on custom optical tracks.',
      category: 'TECHNICAL',
      startDateTime: new Date(Date.now() + 18 * 86400000),
      endDateTime: new Date(Date.now() + 18 * 86400000 + 5 * 3600000),
      venue: 'Mechanical Workshop Hall 1',
      capacity: 80,
      registrationRequired: true,
      organizerId: faculty2.id,
    },
    {
      title: 'Blood Donation & Free Health Screening Camp',
      description: 'Community outreach initiative in collaboration with Government Medical College Blood Bank.',
      category: 'OTHER',
      startDateTime: new Date(Date.now() + 20 * 86400000),
      endDateTime: new Date(Date.now() + 20 * 86400000 + 6 * 3600000),
      venue: 'Campus Medical & Wellness Center',
      capacity: 200,
      registrationRequired: false,
      organizerId: adminUser.id,
    },
    {
      title: 'National Mathematics Day Quiz & Symposium',
      description: 'Commemorating Srinivasa Ramanujan with inter-branch speed mathematics and discrete logic puzzle contests.',
      category: 'ACADEMIC',
      startDateTime: new Date(Date.now() + 25 * 86400000),
      endDateTime: new Date(Date.now() + 25 * 86400000 + 3 * 3600000),
      venue: 'Conference Hall A-102',
      capacity: 100,
      registrationRequired: true,
      organizerId: faculty1.id,
    },
  ];

  for (const e of eventsData) {
    const createdEvent = await prisma.event.create({
      data: e,
    });

    // Register student1 for first 2 events
    if (e.title.includes('Code-A-Thon') || e.title.includes('Drone')) {
      await prisma.eventRegistration.upsert({
        where: {
          eventId_userId: { eventId: createdEvent.id, userId: student1.id },
        },
        update: {},
        create: {
          eventId: createdEvent.id,
          userId: student1.id,
          status: 'REGISTERED',
        },
      });
    }
  }

  // 5. Demo Service Requests (10 Helpdesk tickets)
  const serviceRequestsData = [
    {
      title: 'Projector display flickering in Classroom A-204',
      description: 'The HDMI connection flickers intermittently every few minutes during lectures in Room A-204.',
      category: 'PROJECTOR',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      locationDetails: 'Academic Block A, 2nd Floor, Room 204',
      assignedDepartmentId: cseDept.id,
      assignedTo: adminUser.id,
    },
    {
      title: 'High-speed Wi-Fi router rebooting in Lab 3',
      description: 'Access Point AP-CSE-03 drops connections when more than 30 systems connect simultaneously.',
      category: 'WIFI',
      priority: 'MEDIUM',
      status: 'ASSIGNED',
      locationDetails: 'Computer Center Wing B, Lab 3',
      assignedTo: adminUser.id,
    },
    {
      title: 'Drinking water cooler low cooling on 1st floor',
      description: 'The RO water dispenser near the east staircase in Academic Block A is dispensing warm water.',
      category: 'WATER',
      priority: 'MEDIUM',
      status: 'OPEN',
      locationDetails: 'Academic Block A, Floor 1 East Wing',
    },
    {
      title: 'Tube light non-functional in Library Reading Section C',
      description: 'Two overhead LED lights are off near table numbers 14-18 in the quiet study wing.',
      category: 'ELECTRICAL',
      priority: 'LOW',
      status: 'RESOLVED',
      resolvedAt: new Date(Date.now() - 86400000),
      locationDetails: 'Central Library, Ground Floor Section C',
      assignedTo: adminUser.id,
    },
    {
      title: 'Broken chair armrest in Seminar Hall A-201',
      description: 'Second row chair #4 has a loose armrest that requires screw tightening.',
      category: 'FURNITURE',
      priority: 'LOW',
      status: 'CLOSED',
      resolvedAt: new Date(Date.now() - 3 * 86400000),
      closedAt: new Date(Date.now() - 2 * 86400000),
      locationDetails: 'Seminar Hall A-201',
      assignedTo: adminUser.id,
    },
    {
      title: 'Cleanliness request for Restroom Block 2F',
      description: 'Sanitization and liquid soap replenishment needed in 2nd floor male washrooms.',
      category: 'CLEANLINESS',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      locationDetails: 'Academic Block B, Floor 2',
      assignedTo: adminUser.id,
    },
    {
      title: 'LAN port #12 disconnected in Robotics Lab',
      description: 'Network jack #12 has no carrier signal to the switch.',
      category: 'WIFI',
      priority: 'MEDIUM',
      status: 'OPEN',
      locationDetails: 'Robotics Workshop B-002',
    },
    {
      title: 'Door latch sticking in Conference Room A-102',
      description: 'Main entrance latch catches and requires force to open.',
      category: 'INFRASTRUCTURE',
      priority: 'LOW',
      status: 'OPEN',
      locationDetails: 'Academic Block A, Ground Floor',
    },
    {
      title: 'Microphone feedback noise during lectures',
      description: 'Cordless wireless lapel mic generates loud hum when near the faculty podium.',
      category: 'PROJECTOR',
      priority: 'HIGH',
      status: 'RESOLVED',
      resolvedAt: new Date(Date.now() - 1 * 86400000),
      locationDetails: 'Auditorium Main Hall',
      assignedTo: adminUser.id,
    },
    {
      title: 'Power spike trip on workbench socket 4',
      description: 'Circuit breaker tripped after connecting digital storage oscilloscope.',
      category: 'ELECTRICAL',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      locationDetails: 'Electronics & Hardware Lab A-105',
      assignedTo: adminUser.id,
    },
  ];

  for (const sr of serviceRequestsData) {
    const createdReq = await prisma.serviceRequest.create({
      data: {
        ...sr,
        requesterId: student1.id,
      },
    });

    // Add initial history
    await prisma.serviceRequestHistory.create({
      data: {
        requestId: createdReq.id,
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: student1.id,
        comment: 'Request logged through Campus 360 portal.',
      },
    });

    if (sr.status !== 'OPEN') {
      await prisma.serviceRequestHistory.create({
        data: {
          requestId: createdReq.id,
          oldStatus: 'OPEN',
          newStatus: sr.status,
          changedBy: adminUser.id,
          comment: `Status escalated to ${sr.status} by Estate & IT Maintenance Desk.`,
        },
      });

      await prisma.serviceRequestComment.create({
        data: {
          requestId: createdReq.id,
          authorId: adminUser.id,
          content: `Technician assigned for investigation. Work order #WO-${createdReq.id.slice(0, 6).toUpperCase()}.`,
        },
      });
    }
  }

  // 6. Demo Lost & Found Records (10 records)
  const lostFoundData = [
    {
      type: 'FOUND',
      title: 'Black Casio Scientific Calculator (fx-991EX)',
      description: 'Found on table #7 in Central Library reading hall after 4:00 PM.',
      category: 'ELECTRONICS',
      locationText: 'Central Library, Ground Floor',
      itemDate: new Date(Date.now() - 2 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'LOST',
      title: 'Blue Campus Smart ID Card & Lanyard',
      description: 'Lost ID card belonging to CSE department with blue TGPCET lanyard near Canteen plaza.',
      category: 'ID_DOCUMENT',
      locationText: 'Canteen & Food Court pathway',
      itemDate: new Date(Date.now() - 3 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'FOUND',
      title: 'Black Fastrack Water Bottle (750ml)',
      description: 'Stainless steel bottle left on bench outside Classroom A-102.',
      category: 'OTHER',
      locationText: 'Academic Block A Portico',
      itemDate: new Date(Date.now() - 4 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'LOST',
      title: 'Database System Concepts (Silberschatz) Textbook',
      description: 'Hardcover textbook with yellow bookmark left in Computer Lab A-101.',
      category: 'BOOK',
      locationText: 'Computer Lab A-101',
      itemDate: new Date(Date.now() - 5 * 86400000),
      status: 'CLAIMED',
    },
    {
      type: 'FOUND',
      title: 'Boat Wireless Earbuds Charging Case (Navy Blue)',
      description: 'Found near cricket practice nets in sports ground.',
      category: 'ELECTRONICS',
      locationText: 'Sports Complex Arena',
      itemDate: new Date(Date.now() - 1 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'LOST',
      title: 'Keyring with Two Motorcycle Keys and Honda Keychain',
      description: 'Misplaced keys in two-wheeler parking lot near Main Gate.',
      category: 'ACCESSORY',
      locationText: 'Student Parking Area P1',
      itemDate: new Date(Date.now() - 6 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'FOUND',
      title: 'Grey Titan Spectacles with Rectangular Frame',
      description: 'Found in Seminar Hall A-201 row 5.',
      category: 'ACCESSORY',
      locationText: 'Seminar Hall A-201',
      itemDate: new Date(Date.now() - 7 * 86400000),
      status: 'RESOLVED',
    },
    {
      type: 'LOST',
      title: 'Black Folding Umbrella with Wooden Handle',
      description: 'Left near umbrella stand at Academic Block B entrance during rain.',
      category: 'OTHER',
      locationText: 'Academic Block B Entrance',
      itemDate: new Date(Date.now() - 8 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'FOUND',
      title: 'Engineering Drawing Instrument Box & Drafter Cover',
      description: 'Found in Mechanical Workshop CAD lab.',
      category: 'OTHER',
      locationText: 'Mechanical Workshop Wing',
      itemDate: new Date(Date.now() - 9 * 86400000),
      status: 'OPEN',
    },
    {
      type: 'FOUND',
      title: 'SanDisk 64GB USB 3.0 Flash Drive',
      description: 'Metallic USB stick plugged into Lab PC #24 in Computer Lab A-101.',
      category: 'ELECTRONICS',
      locationText: 'Computer Lab A-101',
      itemDate: new Date(Date.now() - 1 * 86400000),
      status: 'OPEN',
    },
  ];

  for (const lf of lostFoundData) {
    const item = await prisma.lostFoundItem.create({
      data: {
        ...lf,
        reportedById: student2.id,
      },
    });

    if (lf.status === 'CLAIMED') {
      await prisma.lostFoundClaim.create({
        data: {
          itemId: item.id,
          claimantId: student1.id,
          description: 'This is my textbook with my signature and PRN inside the front cover.',
          contactInfo: 'student@demo.local',
          status: 'APPROVED',
          moderatedById: adminUser.id,
        },
      });
    }
  }

  // 7. Demo Emergency Contacts (5 contacts)
  const emergencyContactsData = [
    {
      name: 'Campus Security Central Control Room',
      category: 'SECURITY',
      phone: '+91 712 2800 100',
      altPhone: '+91 712 2800 101',
      email: 'security@demo.tgpcet.local',
      locationText: 'Main Gate Security Gatehouse',
      instructions: 'Available 24/7 for on-campus security assistance, incident reporting, and gate access.',
      priority: 1,
      isDemo: true,
    },
    {
      name: 'Campus Health & Medical First Aid Center',
      category: 'MEDICAL',
      phone: '+91 712 2800 108',
      altPhone: '+91 98900 11223',
      email: 'medical@demo.tgpcet.local',
      locationText: 'Medical Room, Ground Floor Admin Wing',
      instructions: 'Resident doctor and paramedic on duty. Ambulance service available for immediate hospital transit.',
      priority: 1,
      isDemo: true,
    },
    {
      name: 'Nagpur Fire & Rescue Emergency Services',
      category: 'FIRE',
      phone: '101',
      altPhone: '+91 712 2542 222',
      locationText: 'MIDC Fire Station (3 km from campus)',
      instructions: 'Call immediately in case of active fire, smoke detection, or hazardous chemical spillage.',
      priority: 2,
      isDemo: true,
    },
    {
      name: 'Women Helpline & Internal Complaints Committee (ICC)',
      category: 'HELPLINE',
      phone: '+91 712 2800 109',
      altPhone: '1091',
      email: 'icc@demo.tgpcet.local',
      locationText: 'Administrative Block A, Room 105',
      instructions: 'Confidential support helpline for women safety and anti-harassment counseling.',
      priority: 2,
      isDemo: true,
    },
    {
      name: 'Anti-Ragging Squad & Student Welfare Cell',
      category: 'ADMIN',
      phone: '+91 712 2800 110',
      altPhone: '1800 180 5522',
      email: 'antiragging@demo.tgpcet.local',
      locationText: 'Principal Office Secretariat',
      instructions: 'Zero tolerance anti-ragging helpline with direct Dean and Principal escalations.',
      priority: 3,
      isDemo: true,
    },
  ];

  for (const ec of emergencyContactsData) {
    await prisma.emergencyContact.create({
      data: ec,
    });
  }

  // 8. Demo Feedback
  const feedbackData = [
    {
      userId: student1.id,
      targetType: 'SERVICE',
      targetId: 'ELECTRICAL',
      rating: 5,
      comment: 'The electrical repair in the lab was resolved promptly within 2 hours. Very satisfied!',
    },
    {
      userId: student2.id,
      targetType: 'FACILITY',
      targetId: 'LIBRARY',
      rating: 5,
      comment: 'Library extended study hours during exam month are extremely helpful for revision.',
    },
    {
      userId: student3.id,
      targetType: 'GENERAL',
      rating: 4,
      comment: 'Campus 360 interactive map and helpdesk services make navigation and queries effortless.',
    },
  ];

  for (const fb of feedbackData) {
    await prisma.feedback.create({ data: fb });
  }

  // 9. Demo Notifications for student1
  const demoNotifications = [
    {
      userId: student1.id,
      type: 'NOTICE',
      title: 'Urgent Notice: Exam Schedule Released',
      message: 'Winter 2025 Autonomous examination timetable is now available.',
      referenceType: 'NOTICE',
      isRead: false,
    },
    {
      userId: student1.id,
      type: 'EVENT',
      title: 'Registration Confirmed: Code-A-Thon 2025',
      message: 'You have been registered for the 24-Hour Hackathon.',
      referenceType: 'EVENT',
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: student1.id,
      type: 'SERVICE_REQUEST',
      title: 'Service Request Assigned: Projector A-204',
      message: 'Technician has been assigned to your projector request.',
      referenceType: 'SERVICE_REQUEST',
      isRead: false,
    },
  ];

  for (const notif of demoNotifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('✅ Campus 360 Phase 4 Services & Engagement seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during Phase 2/3/4 database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

