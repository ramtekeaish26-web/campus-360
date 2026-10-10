import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

async function testDatabase() {
  console.log('====================================================');
  console.log('🔍 Testing Campus 360 Database Connection...');
  console.log('====================================================');
  console.log(`Target URL: ${env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`Supabase URL: ${env.SUPABASE_URL || 'Not set'}`);
  console.log('----------------------------------------------------');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
  });

  const startTime = Date.now();

  try {
    // 1. Ping database with simple query
    await prisma.$queryRaw`SELECT 1 as connected`;
    const latency = Date.now() - startTime;
    console.log(`✅ Database connection successful! (Ping latency: ${latency}ms)`);

    // 2. Query table counts if migrations exist
    try {
      const usersCount = await prisma.user.count();
      const rolesCount = await prisma.role.count();
      const deptsCount = await prisma.department.count();
      const termsCount = await prisma.academicTerm.count();
      const subjectsCount = await prisma.subject.count();
      const offeringsCount = await prisma.courseOffering.count();
      const enrollmentsCount = await prisma.enrollment.count();
      const schedulesCount = await prisma.classSchedule.count();
      const attendanceCount = await prisma.attendanceRecord.count();
      const assignmentsCount = await prisma.assignment.count();
      const examsCount = await prisma.exam.count();
      const resultsCount = await prisma.examResult.count();
      const eventsCount = await prisma.academicCalendarEvent.count();

      console.log('\n📊 Database Records Found:');
      console.log(`  - Users:             ${usersCount}`);
      console.log(`  - Roles:             ${rolesCount}`);
      console.log(`  - Departments:       ${deptsCount}`);
      console.log(`  - Academic Terms:    ${termsCount}`);
      console.log(`  - Subjects:          ${subjectsCount}`);
      console.log(`  - Course Offerings:  ${offeringsCount}`);
      console.log(`  - Enrollments:       ${enrollmentsCount}`);
      console.log(`  - Class Schedules:   ${schedulesCount}`);
      console.log(`  - Attendance Records:${attendanceCount}`);
      console.log(`  - Assignments:       ${assignmentsCount}`);
      console.log(`  - Exams:             ${examsCount}`);
      console.log(`  - Exam Results:      ${resultsCount}`);
      console.log(`  - Calendar Events:   ${eventsCount}`);
    } catch {
      console.log('\n⚠️ Connected to PostgreSQL, but tables have not been created yet.');
      console.log('👉 Run `npm run db:migrate` or `npm run db:seed` to deploy schema.');
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`❌ Connection failed after ${latency}ms:`);
    console.error(`  Error Code: ${error.code || 'UNKNOWN'}`);
    console.error(`  Message:    ${error.message || error}`);
    console.log('\n💡 Tip for Supabase:');
    console.log('If you want to connect to your Supabase PostgreSQL instance directly, copy the connection URI from:');
    console.log('  Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)');
    console.log('and update DATABASE_URL in your .env file:');
    console.log('  DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
