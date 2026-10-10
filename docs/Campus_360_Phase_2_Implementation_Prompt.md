# CAMPUS 360 — PHASE 2 IMPLEMENTATION PROMPT

You are now implementing PHASE 2 of Campus 360 for TGPCET.

Phase 1 has already been implemented.

DO NOT rebuild Phase 1.

DO NOT start Phase 3.

DO NOT implement Gemini or any AI functionality.

DO NOT implement campus maps/navigation yet.

DO NOT implement events, clubs, placements, issue reporting, or advanced intelligence yet.

The purpose of Phase 2 is to build the Academic Core of Campus 360.

============================================================
1. FIRST: INSPECT THE EXISTING PROJECT
============================================================

Before changing anything, inspect:

docs/Campus_360_PRD_v1.0.md
docs/Campus_360_SRS_v1.0.md
docs/Campus_360_Phases_v1.0.md
docs/Campus_360_Phase_1_Technical_Spec_v1.0.md

Also inspect:

frontend/
backend/
database/
tests/
design/stitch/

Understand the existing Phase 1 architecture.

DO NOT replace working architecture unnecessarily.

Reuse:

- authentication
- Supabase integration
- database connection
- Prisma
- role authorization
- API client
- routing
- UI component system
- error handling
- validation
- testing infrastructure

============================================================
2. PHASE 2 OBJECTIVE
============================================================

Build the Academic Core of Campus 360.

The system should allow authenticated users to interact with academic information according to their role.

The three primary roles remain:

STUDENT
FACULTY
ADMIN

The backend remains the security boundary.

The frontend must never be trusted for authorization.

============================================================
3. PHASE 2 MODULES
============================================================

Implement these modules:

1. Academic Dashboard
2. Subjects / Courses
3. Class Schedule
4. Attendance
5. Assignments
6. Exams
7. Results / Grades
8. Academic Calendar

Each module must have appropriate role permissions.

============================================================
4. STUDENT EXPERIENCE
============================================================

Students should be able to see:

Dashboard
Subjects
Today's / upcoming classes
Attendance
Assignments
Exams
Results
Academic calendar

The student must only see academic records belonging to the authenticated student.

A student must NEVER be able to request another student's private academic records by changing an ID in the URL.

Example:

GET /api/students/{studentId}/attendance

must verify that the authenticated student is actually allowed to access that studentId.

============================================================
5. FACULTY EXPERIENCE
============================================================

Faculty should be able to see:

Faculty Dashboard
Assigned subjects
Teaching schedule
Student attendance for authorized classes
Assignments they manage
Exams they manage
Relevant academic records

Faculty must only access academic records for subjects/classes they are assigned to.

Do not allow a faculty member to arbitrarily access all students.

============================================================
6. ADMIN EXPERIENCE
============================================================

Admin should be able to manage:

Departments
Programs
Subjects
Sections/classes
Academic terms
Schedules
Faculty assignments
Student enrollments
Attendance records
Assignments
Exams
Results

Admin has broader permissions than Student and Faculty.

All admin operations must still use backend authorization.

============================================================
7. DATABASE DESIGN
============================================================

Extend the existing PostgreSQL/Prisma schema.

Create appropriate entities for:

AcademicTerm
Department
Program
Course/Subject
CourseOffering
Section
Enrollment
ClassSchedule
AttendanceSession
AttendanceRecord
Assignment
AssignmentSubmission
Exam
ExamResult
AcademicCalendarEvent

Reuse existing:

User
Profile
Role
Department
Program

where appropriate.

Do NOT create duplicate user/profile/department/program tables.

============================================================
8. ACADEMIC TERMS
============================================================

Create academic terms such as:

2025-26 Semester 1
2025-26 Semester 2

Use a proper database representation.

Do not hardcode academic terms throughout frontend components.

Academic term should have:

id
name
academicYear
semester
startDate
endDate
status

Possible status:

UPCOMING
ACTIVE
COMPLETED

Only one term should be ACTIVE where the business rules require it.

============================================================
9. SUBJECTS
============================================================

A subject/course should contain:

id
code
name
description
credits
departmentId
programId
semester
status

Example development data may be used.

Use clearly marked DEMO data.

Do not use real student data.

============================================================
10. COURSE OFFERINGS
============================================================

Separate a reusable subject from a semester-specific offering.

Example:

Subject:
CS301 — Database Management Systems

Offering:
CS301
2025-26
Semester 5
CSE-A
Faculty X

This is important because the same subject can exist across different academic terms.

============================================================
11. ENROLLMENT
============================================================

Students should be enrolled into course offerings.

An enrollment should contain:

studentId
courseOfferingId
enrolledAt
status

Possible status:

ACTIVE
DROPPED
COMPLETED

Students should only see their own enrollments.

============================================================
12. CLASS SCHEDULE
============================================================

Create schedule records containing:

courseOffering
dayOfWeek
startTime
endTime
room
building
faculty
section

Students should see:

Today's classes
Upcoming classes
Weekly timetable

Faculty should see:

Their teaching timetable.

Do not implement GPS/navigation yet.

Room/building should remain normal structured data.

============================================================
13. ATTENDANCE
============================================================

Create:

AttendanceSession

and:

AttendanceRecord

AttendanceSession should identify:

course
faculty
date
startTime
endTime
section

AttendanceRecord should identify:

student
session
status

Allowed statuses:

PRESENT
ABSENT
LATE
EXCUSED

Students:

- view attendance
- see attendance percentage
- see subject-wise attendance

Faculty:

- record attendance for authorized sessions
- view attendance for their classes

Admin:

- manage/inspect attendance

Do not allow students to modify attendance.

============================================================
14. ATTENDANCE CALCULATION
============================================================

Attendance percentage must be calculated from actual records.

Do not hardcode:

"87%"
"92%"
etc.

Example:

percentage =
present / eligibleSessions * 100

Define how LATE and EXCUSED are treated in the business rules.

Do not duplicate calculation logic across frontend and backend.

Prefer backend/service-layer calculation.

============================================================
15. ASSIGNMENTS
============================================================

Assignments should support:

title
description
course
faculty
dueDate
createdAt
status

Students should see:

Upcoming assignments
Overdue assignments
Completed/submitted assignments

Faculty should be able to:

Create assignment
Edit assignment
View submissions

Students should be able to:

Submit assignment

For Phase 2, submission may initially support:

text response

Do NOT build complex file storage unless already specified by the SRS.

============================================================
16. EXAMS
============================================================

Create exam records:

title
course
examType
date
startTime
endTime
room
status

Exam types may include:

MIDTERM
END_SEMESTER
PRACTICAL
QUIZ

Students can view exams relevant to their enrolled courses.

Faculty/admin can manage according to role.

============================================================
17. RESULTS
============================================================

Create:

ExamResult

Fields should include:

studentId
examId
courseOfferingId
marks
maxMarks
grade
status

Students can view only their own results.

Faculty can access results only for authorized courses/exams.

Admin can manage results.

Do not invent complicated grading rules without a defined requirement.

Create a central grade calculation service if grade calculation is required.

============================================================
18. ACADEMIC CALENDAR
============================================================

Create academic calendar events.

Examples:

Semester Start
Semester End
Exam Period
Holiday
Assignment Deadline
Result Declaration

Fields:

title
description
eventType
startDate
endDate
visibility

Use:

ACADEMIC
EXAM
HOLIDAY
DEADLINE
OTHER

Students, faculty and admin should see appropriate calendar events.

============================================================
19. API DESIGN
============================================================

Create REST APIs following the existing API architecture.

Example:

GET /api/academic/dashboard

GET /api/subjects

GET /api/subjects/:id

GET /api/enrollments

GET /api/schedule

GET /api/schedule/today

GET /api/attendance

GET /api/attendance/summary

GET /api/assignments

POST /api/assignments

GET /api/assignments/:id

POST /api/assignments/:id/submit

GET /api/exams

GET /api/results

GET /api/calendar

Admin:

POST /api/admin/subjects
PATCH /api/admin/subjects/:id

POST /api/admin/schedules
PATCH /api/admin/schedules/:id

POST /api/admin/attendance

POST /api/admin/exams

POST /api/admin/results

Use the existing API naming conventions if they differ.

Do not create duplicate API patterns.

============================================================
20. AUTHORIZATION
============================================================

Implement authorization at service/API level.

Examples:

Student:

GET /api/attendance
→ own records only

Student:

GET /api/results
→ own results only

Student:

POST /api/admin/results
→ 403

Faculty:

POST /api/attendance
→ only authorized teaching sessions

Faculty:

GET /api/results
→ only authorized courses/classes

Admin:

→ full administrative academic access

Never rely on frontend hiding buttons.

============================================================
21. FRONTEND ROUTES
============================================================

Add routes such as:

/dashboard

/academic
/academic/subjects
/academic/schedule
/academic/attendance
/academic/assignments
/academic/exams
/academic/results
/academic/calendar

Role-specific routes where required:

/faculty/...
/admin/...

Use existing protected route and role route infrastructure.

============================================================
22. ACADEMIC DASHBOARD
============================================================

Upgrade the current basic dashboard into a useful academic dashboard.

Student dashboard should show:

- current academic term
- today's classes
- upcoming assignments
- upcoming exams
- attendance summary
- recent results
- academic calendar highlights

Faculty dashboard:

- today's classes
- assigned subjects
- pending attendance
- upcoming exams
- assignment activity

Admin dashboard:

- academic term status
- active courses
- active sections
- faculty assignments
- enrollment overview
- academic operations

Do not fabricate metrics.

If data does not exist, show proper empty states.

============================================================
23. UI / STITCH DESIGN
============================================================

Inspect:

design/stitch/

Use existing Campus 360 visual language.

Do not create a completely different design.

Maintain:

- typography
- spacing
- navigation
- cards
- badges
- status indicators
- responsive behavior
- page hierarchy

Create reusable components.

Do not create one huge component for each page.

============================================================
24. RESPONSIVE DESIGN
============================================================

Desktop:

- sidebar
- header
- content area
- dashboard grids

Tablet:

- responsive grid
- collapsible navigation

Mobile:

- mobile navigation
- stacked cards
- horizontally scrollable tables where appropriate
- readable timetable
- accessible controls

Do not simply shrink desktop layouts.

============================================================
25. TABLES
============================================================

Academic data will require tables.

Create reusable table components supporting:

- loading
- empty
- error
- pagination where needed
- responsive behavior

Do not render enormous datasets at once.

============================================================
26. FILTERS
============================================================

Where appropriate support:

Term
Semester
Subject
Date
Status

Do not implement unnecessary complex filtering.

Start with useful filters.

============================================================
27. VALIDATION
============================================================

Use Zod for:

Request bodies
Query parameters
Route parameters

Validate:

marks
dates
times
IDs
status values
assignment data
attendance status

Reject malformed requests.

============================================================
28. DATA INTEGRITY
============================================================

Use database constraints.

Examples:

A student cannot be enrolled twice in the same course offering.

An attendance record cannot exist twice for the same student/session.

An exam result cannot exist twice for the same student/exam.

A schedule should not have impossible time ranges.

Use transactions for multi-record operations where appropriate.

============================================================
29. DEMO DATA
============================================================

Create development seed data.

Include:

3 students
2 faculty
1 admin

At least:

2 departments
2 programs
6 subjects
2 academic terms
multiple course offerings
multiple enrollments
weekly schedules
attendance sessions
attendance records
assignments
assignment submissions
exams
results
calendar events

All data must clearly be DEMO data.

Do not use actual TGPCET student/faculty personal information.

============================================================
30. TESTING
============================================================

Add unit tests for:

attendance calculation
grade calculation
authorization
academic term logic
validation

Integration tests for:

subjects
enrollments
schedule
attendance
assignments
exams
results
calendar

Security tests:

Student cannot access another student's attendance.

Student cannot access another student's results.

Student cannot create attendance.

Student cannot create results.

Faculty cannot access another faculty member's unrelated class.

Faculty cannot modify unauthorized course data.

Admin can perform permitted administrative operations.

============================================================
31. IMPORTANT SECURITY TESTS
============================================================

These MUST pass:

Student:
GET another student's attendance
→ 403 or 404

Student:
GET another student's results
→ 403 or 404

Student:
POST /api/admin/results
→ 403

Student:
POST attendance
→ 403 unless explicitly permitted by business rules

Faculty:
modify unrelated course
→ 403

Admin:
authorized academic management
→ success

============================================================
32. NO FAKE UI DATA
============================================================

Do not make dashboards appear functional by hardcoding fake statistics.

All displayed academic information should come from:

API
database
or intentional empty states.

Demo seed data is acceptable for development.

============================================================
33. ERROR STATES
============================================================

Every academic page must handle:

Loading
Empty
Error
Success

Examples:

"No classes scheduled today."

"No assignments found."

"No examination records available."

"No attendance records available."

Do not display blank screens.

============================================================
34. PERFORMANCE
============================================================

Avoid unnecessary API calls.

Use the existing query/cache strategy.

Do not fetch:

all students
all attendance
all assignments

when only a small subset is required.

Use appropriate database queries.

============================================================
35. DO NOT IMPLEMENT
============================================================

Explicitly DO NOT implement:

- Gemini
- AI assistant
- RAG
- chatbot
- campus map
- GPS
- indoor navigation
- events/club system
- placement system
- issue reporting
- recommendation engine
- advanced analytics
- notifications infrastructure
- payment system
- face recognition
- biometric attendance

These belong to later phases.

============================================================
36. MIGRATIONS
============================================================

Create proper Prisma migrations.

Do not manually modify the production database.

Verify:

migration
reset
seed

work correctly in development.

============================================================
37. README
============================================================

Update README with:

Phase 2 overview
new database entities
migration instructions
seed instructions
API endpoints
role permissions
test commands
development instructions

============================================================
38. VERIFICATION
============================================================

Run:

TypeScript checks

Lint

Unit tests

Integration tests

E2E tests

Frontend production build

Backend production build

Database migration validation

Seed validation

Fix all errors.

============================================================
39. PHASE 2 ACCEPTANCE CRITERIA
============================================================

Phase 2 is complete only when:

[ ] Academic terms work
[ ] Subjects work
[ ] Course offerings work
[ ] Enrollments work
[ ] Student schedule works
[ ] Faculty schedule works
[ ] Attendance works
[ ] Attendance calculation works
[ ] Assignments work
[ ] Assignment submission works
[ ] Exams work
[ ] Results work
[ ] Academic calendar works
[ ] Student dashboard shows academic data
[ ] Faculty dashboard shows academic data
[ ] Admin academic management works
[ ] Student data isolation works
[ ] Faculty authorization works
[ ] Admin authorization works
[ ] Validation works
[ ] Database constraints work
[ ] Seed data works
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] TypeScript has zero errors
[ ] Production build succeeds
[ ] No secrets are committed
[ ] README is updated

============================================================
40. FINAL RULE
============================================================

Do NOT move to Phase 3 automatically.

After completing Phase 2, report:

1. Files created
2. Files modified
3. Database models added
4. Migrations created
5. API endpoints added
6. Frontend routes added
7. Role permissions implemented
8. Tests added
9. Test results
10. Build results
11. Known issues
12. Manual verification steps

Then STOP.

PHASE 2 ONLY.