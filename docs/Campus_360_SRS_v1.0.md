# CAMPUS 360 --- SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

**Project:** Campus 360\
**Institution Context:** TGPCET Campus\
**Document:** Software Requirements Specification\
**Version:** 1.0\
**Status:** Development Specification\
**Related Product Document:** Campus 360 PRD v1.0\
**Audience:** Developers, IDE coding agents, database/backend
developers, testers, project guide

------------------------------------------------------------------------

# 1. Purpose

This Software Requirements Specification defines the technical and
functional requirements for implementing Campus 360.

The PRD defines **what product should exist and why**.

This SRS defines **how the software must behave and what technical
capabilities it must provide**.

The system will provide role-based digital experiences for:

-   Students
-   Faculty
-   Administrators

The initial system should be built as a responsive web application with
a modular architecture that can later support additional institutional
integrations.

------------------------------------------------------------------------

# 2. System Scope

Campus 360 consists of:

1.  Authentication and authorization
2.  Role-based dashboards
3.  Academic management
4.  Timetable
5.  Attendance
6.  Assignments
7.  Exams/results
8.  Campus locations and map
9.  Facilities
10. Opportunities
11. Placement/career
12. Events and clubs
13. Student services
14. Issue reporting
15. Announcements
16. Notifications
17. Student profile
18. AI assistant
19. Recommendation/matching
20. Admin analytics

The system must be modular so that individual modules can evolve without
rewriting the entire application.

------------------------------------------------------------------------

# 3. System Users

## 3.1 Student

The student is permitted to:

-   authenticate,
-   view their profile,
-   view their academic information,
-   view their timetable,
-   view their attendance,
-   view assignments,
-   view exams/results,
-   browse campus locations,
-   browse facilities,
-   browse opportunities,
-   save opportunities,
-   browse events,
-   register for events,
-   submit services,
-   track service requests,
-   report issues,
-   view notifications,
-   use the AI assistant.

## 3.2 Faculty

Faculty is permitted to:

-   authenticate,
-   view profile,
-   view assigned classes,
-   view authorized students,
-   manage authorized attendance,
-   manage assigned academic content,
-   publish authorized announcements,
-   view/respond to authorized requests.

## 3.3 Admin

Admin is permitted to:

-   manage users,
-   manage roles,
-   manage departments,
-   manage academic records,
-   manage locations,
-   manage facilities,
-   manage events,
-   manage opportunities,
-   manage announcements,
-   manage services,
-   manage issues,
-   view analytics,
-   manage approved AI knowledge content.

------------------------------------------------------------------------

# 4. Technology Requirements

The initial implementation should use the following stack unless a
project-level decision changes it.

## 4.1 Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   TanStack Query
-   React Hook Form
-   Zod
-   Recharts or equivalent charting library

## 4.2 Backend

-   Node.js
-   TypeScript
-   Express

The backend must own business logic that cannot safely be trusted to the
browser.

## 4.3 Database

-   PostgreSQL
-   Supabase may provide the managed PostgreSQL environment.

## 4.4 Authentication

-   Supabase Auth or equivalent secure authentication service.

## 4.5 Storage

Object storage should be used for:

-   campus photos,
-   profile images where required,
-   service attachments,
-   issue attachments,
-   approved documents.

## 4.6 Maps

A mapping provider may be used for:

-   base map,
-   coordinates,
-   directions,
-   routing where available.

TGPCET-specific locations must be stored in the application's database
rather than hard-coded into the frontend.

## 4.7 AI

Gemini API or an equivalent approved model provider may be used.

AI calls must be performed server-side.

------------------------------------------------------------------------

# 5. System Architecture

The logical architecture shall be:

``` text
┌────────────────────────────────────┐
│          Student / Faculty / Admin │
└───────────────────┬────────────────┘
                    │
                    ▼
┌────────────────────────────────────┐
│ React + TypeScript Web Application  │
│ UI / Routing / Client State         │
└───────────────────┬────────────────┘
                    │ HTTPS
                    ▼
┌────────────────────────────────────┐
│ Node.js + Express API               │
│ Auth / Authorization / Business     │
│ Logic / Validation                  │
└───────────────┬───────────┬────────┘
                │           │
                ▼           ▼
        ┌─────────────┐  ┌──────────────┐
        │ PostgreSQL  │  │ Object       │
        │ Database    │  │ Storage      │
        └─────────────┘  └──────────────┘
                │
                ▼
        ┌──────────────┐
        │ AI Retrieval │
        │ / AI Service │
        └──────────────┘
```

External services:

``` text
Maps Provider
AI Provider
Email/Notification Provider (future)
Institutional Systems (future)
```

------------------------------------------------------------------------

# 6. Architectural Principles

## AR-001 Modular Design

Each major feature should be implemented as a module.

## AR-002 Separation of Concerns

The system should separate:

-   UI,
-   API,
-   business logic,
-   data access,
-   external services.

## AR-003 Server-Side Authorization

Frontend role checks are for user experience only.

Actual authorization must occur at the backend/database layer.

## AR-004 Data Ownership

Each entity should have a clear owner and access policy.

## AR-005 Configuration Over Hard-Coding

Thresholds, categories, service types, and similar values should be
configurable where practical.

## AR-006 Provider Independence

Application domain models should not depend unnecessarily on a single
external vendor.

------------------------------------------------------------------------

# 7. Functional Requirements

## 7.1 Authentication

### FR-AUTH-001

The system shall allow authorized users to sign in.

### FR-AUTH-002

The system shall maintain an authenticated session.

### FR-AUTH-003

The system shall allow users to sign out.

### FR-AUTH-004

The system shall support password reset through the selected
authentication provider.

### FR-AUTH-005

The system shall redirect users to the correct role-specific application
area after authentication.

### FR-AUTH-006

Unauthenticated users shall not access protected application routes.

------------------------------------------------------------------------

# 8. Authorization

### FR-AUTHZ-001

Each user shall have a role.

Supported initial roles:

-   STUDENT
-   FACULTY
-   ADMIN

### FR-AUTHZ-002

Protected API endpoints shall verify the authenticated user's identity.

### FR-AUTHZ-003

Protected API endpoints shall verify authorization.

### FR-AUTHZ-004

A student shall only access their own private academic/service
information unless explicitly authorized otherwise.

### FR-AUTHZ-005

Faculty shall only access data associated with authorized
classes/departments/responsibilities.

### FR-AUTHZ-006

Administrative operations shall require administrative permissions.

### FR-AUTHZ-007

Changing UI visibility must not be considered sufficient authorization.

------------------------------------------------------------------------

# 9. Dashboard Requirements

### FR-DASH-001

The system shall provide a dashboard for each role.

### FR-DASH-002

The student dashboard shall display:

-   next/upcoming class,
-   attendance snapshot,
-   announcements,
-   upcoming events,
-   opportunities,
-   pending services,
-   alerts.

### FR-DASH-003

The faculty dashboard shall display:

-   today's classes,
-   pending attendance,
-   relevant assignments,
-   announcements,
-   pending actions.

### FR-DASH-004

The admin dashboard shall display:

-   user/activity summary,
-   pending requests,
-   unresolved issues,
-   content activity,
-   analytics summary.

### FR-DASH-005

Dashboard cards shall link to their detailed workflows.

------------------------------------------------------------------------

# 10. Academic Requirements

## 10.1 Departments and Programs

### FR-ACAD-001

The system shall maintain departments.

### FR-ACAD-002

The system shall maintain programs/courses.

### FR-ACAD-003

The system shall associate students and faculty with appropriate
academic structures.

------------------------------------------------------------------------

## 10.2 Subjects

### FR-ACAD-004

The system shall maintain subjects.

### FR-ACAD-005

A subject shall support at minimum:

-   code,
-   name,
-   department,
-   semester/year,
-   credits where applicable.

------------------------------------------------------------------------

## 10.3 Enrollment

### FR-ACAD-006

The system shall associate students with their enrolled subjects.

------------------------------------------------------------------------

## 10.4 Timetable

### FR-ACAD-007

The system shall store class schedules.

A schedule should support:

-   subject,
-   faculty,
-   day,
-   start time,
-   end time,
-   room/location,
-   section.

### FR-ACAD-008

Students shall see schedules relevant to their enrollment.

### FR-ACAD-009

Faculty shall see schedules relevant to their assigned classes.

------------------------------------------------------------------------

## 10.5 Attendance

### FR-ACAD-010

Authorized faculty shall be able to record attendance.

### FR-ACAD-011

Students shall be able to view their own attendance.

### FR-ACAD-012

The system shall calculate attendance percentages.

### FR-ACAD-013

Attendance thresholds shall be configurable.

------------------------------------------------------------------------

## 10.6 Assignments

### FR-ACAD-014

Authorized faculty shall be able to create assignments.

### FR-ACAD-015

Assignments shall support:

-   title,
-   description,
-   subject,
-   due date,
-   attachments where required,
-   status.

### FR-ACAD-016

Students shall see assignments associated with their enrolled subjects.

------------------------------------------------------------------------

## 10.7 Exams and Results

### FR-ACAD-017

The system shall store examination information.

### FR-ACAD-018

Students shall only see their own results.

### FR-ACAD-019

Authorized faculty/admin users shall manage applicable academic records.

------------------------------------------------------------------------

# 11. Campus Map Requirements

## 11.1 Location Entity

A location shall support:

-   ID,
-   name,
-   slug,
-   category,
-   description,
-   building,
-   floor,
-   room number,
-   latitude,
-   longitude,
-   image/media,
-   contact,
-   opening/closing time where applicable,
-   active status.

### FR-CAMPUS-001

The system shall allow users to search campus locations.

### FR-CAMPUS-002

The system shall allow category filtering.

### FR-CAMPUS-003

The system shall display location details.

### FR-CAMPUS-004

The system shall display coordinates using the selected mapping
provider.

### FR-CAMPUS-005

Authorized admins shall be able to create/update/deactivate locations.

### FR-CAMPUS-006

The frontend shall not hard-code campus locations.

### FR-CAMPUS-007

The system shall support location photos.

### FR-CAMPUS-008

The system may provide external map directions.

### FR-CAMPUS-009

The system shall not claim indoor navigation unless indoor mapping is
implemented.

------------------------------------------------------------------------

# 12. Facilities Requirements

### FR-FAC-001

The system shall maintain a facility directory.

### FR-FAC-002

Users shall be able to search facilities.

### FR-FAC-003

Facility records shall support:

-   name,
-   type,
-   location,
-   description,
-   contact,
-   hours,
-   images.

### FR-FAC-004

Only authorized users shall manage facility records.

------------------------------------------------------------------------

# 13. Opportunity Requirements

### FR-OPP-001

The system shall allow authorized administrators to create
opportunities.

### FR-OPP-002

An opportunity shall support:

-   title,
-   provider/organization,
-   type,
-   description,
-   eligibility,
-   deadline,
-   skills,
-   link,
-   status.

### FR-OPP-003

Students shall be able to browse opportunities.

### FR-OPP-004

Students shall be able to filter opportunities.

### FR-OPP-005

Students shall be able to save opportunities.

### FR-OPP-006

The system shall support external application links.

------------------------------------------------------------------------

# 14. Opportunity Matching Requirements

### FR-MATCH-001

The system shall support matching a student's profile against
opportunities.

### FR-MATCH-002

The initial matching algorithm shall be deterministic.

### FR-MATCH-003

The match calculation may consider:

-   eligibility,
-   branch,
-   year,
-   skills,
-   interests.

### FR-MATCH-004

The system shall provide match reasons.

### FR-MATCH-005

The system shall not represent a match score as a guarantee of
selection.

------------------------------------------------------------------------

# 15. Placement and Career Requirements

### FR-CAREER-001

The system shall support placement announcements.

### FR-CAREER-002

The system shall support placement opportunities/drives.

### FR-CAREER-003

Placement information shall support eligibility criteria.

### FR-CAREER-004

Students shall only access placement information allowed for their
role/status.

------------------------------------------------------------------------

# 16. Event and Club Requirements

### FR-EVENT-001

Authorized users shall be able to create events.

### FR-EVENT-002

Events shall support:

-   title,
-   description,
-   organizer,
-   date,
-   start time,
-   end time,
-   venue,
-   registration requirement,
-   capacity where applicable.

### FR-EVENT-003

Students shall be able to browse events.

### FR-EVENT-004

Students shall be able to register for eligible events.

### FR-EVENT-005

The system shall prevent duplicate registration where applicable.

### FR-EVENT-006

The system shall maintain registration records.

------------------------------------------------------------------------

# 17. Service Request Requirements

### FR-SVC-001

The system shall maintain service types.

### FR-SVC-002

Students shall be able to submit service requests.

### FR-SVC-003

A service request shall contain:

-   requester,
-   service type,
-   description,
-   submitted time,
-   status,
-   assigned handler where applicable,
-   attachments where applicable.

### FR-SVC-004

Each request shall have a unique request ID.

### FR-SVC-005

Students shall be able to view their own request history.

### FR-SVC-006

Authorized staff/admins shall be able to assign requests.

### FR-SVC-007

Authorized users shall be able to update request status.

### FR-SVC-008

Status history shall be retained.

------------------------------------------------------------------------

# 18. Issue Reporting Requirements

### FR-ISSUE-001

Authenticated users shall be able to report campus issues.

### FR-ISSUE-002

An issue shall support:

-   title,
-   description,
-   category,
-   location,
-   reporter,
-   attachments,
-   status,
-   timestamps.

### FR-ISSUE-003

The system shall allow authorized staff/admins to triage issues.

### FR-ISSUE-004

Issues shall support assignment.

### FR-ISSUE-005

Issues shall maintain status history.

### FR-ISSUE-006

The reporter shall be able to see the status of their own issue.

------------------------------------------------------------------------

# 19. Communication Requirements

## Announcements

### FR-COM-001

Authorized users shall be able to create announcements.

### FR-COM-002

Announcements shall support audience targeting.

### FR-COM-003

Announcements shall support publication status.

### FR-COM-004

Users shall see announcements relevant to them.

## Notifications

### FR-COM-005

The system shall create in-app notifications for relevant events.

Examples:

-   service status changed,
-   issue updated,
-   event registration,
-   important announcement,
-   opportunity deadline.

### FR-COM-006

Users shall be able to mark notifications as read.

------------------------------------------------------------------------

# 20. Student Profile Requirements

### FR-PROFILE-001

The system shall maintain a student profile.

### FR-PROFILE-002

The basic profile shall support:

-   name,
-   student ID,
-   department,
-   program,
-   year,
-   section.

### FR-PROFILE-003

The profile may support:

-   skills,
-   interests,
-   projects,
-   certifications,
-   competitions,
-   internships,
-   clubs,
-   career goals.

### FR-PROFILE-004

Students shall be able to manage permitted profile fields.

------------------------------------------------------------------------

# 21. AI Assistant Requirements

### FR-AI-001

The system shall provide a campus-specific AI assistant.

### FR-AI-002

AI requests shall be processed server-side.

### FR-AI-003

The assistant shall identify the user's request intent where required.

### FR-AI-004

The system shall retrieve relevant application/campus information before
generating answers when structured data is required.

### FR-AI-005

AI retrieval shall respect user authorization.

### FR-AI-006

The assistant shall not expose private information to unauthorized
users.

### FR-AI-007

The assistant shall state when information is unavailable.

### FR-AI-008

The assistant shall not fabricate official institutional information.

### FR-AI-009

AI responses may provide links/actions to relevant Campus 360 screens.

------------------------------------------------------------------------

# 22. AI Knowledge / RAG Requirements

RAG is not mandatory for the first MVP.

When implemented:

### FR-RAG-001

Approved documents shall be stored in a controlled knowledge source.

### FR-RAG-002

Documents shall be processed into searchable chunks.

### FR-RAG-003

Retrieval shall occur before generation for applicable queries.

### FR-RAG-004

Retrieved information shall be filtered according to access permissions.

### FR-RAG-005

The system should maintain source metadata.

Potential documents:

-   campus FAQs,
-   procedures,
-   policies,
-   approved notices,
-   student guides,
-   service instructions.

------------------------------------------------------------------------

# 23. Risk Radar Requirements

The initial implementation shall be rule-based.

### FR-RISK-001

The system may evaluate configured indicators.

Possible indicators:

-   attendance below threshold,
-   missing assignments,
-   declining performance,
-   inactivity.

### FR-RISK-002

The system shall use transparent rules.

### FR-RISK-003

The system shall display an attention indicator rather than a definitive
prediction.

### FR-RISK-004

The system shall not claim that a student will fail or succeed based
solely on the indicator.

------------------------------------------------------------------------

# 24. Analytics Requirements

### FR-AN-001

The admin system shall provide aggregate analytics.

### FR-AN-002

Analytics may include:

-   active users,
-   service requests,
-   resolution time,
-   issues,
-   event registrations,
-   opportunity engagement,
-   attendance aggregates.

### FR-AN-003

Analytics shall respect authorization.

### FR-AN-004

Sensitive individual-level information shall not be exposed
unnecessarily.

### FR-AN-005

Analytics pages shall provide meaningful empty states when data is
insufficient.

------------------------------------------------------------------------

# 25. Database Requirements

Initial core entities:

``` text
users
profiles
students
faculty
departments
programs
sections
subjects
enrollments
class_schedules
attendance
assignments
exams
results
announcements
notifications
events
clubs
event_registrations
opportunities
saved_opportunities
placement_drives
services
service_requests
service_request_history
issues
issue_history
locations
facilities
media
skills
student_skills
projects
certifications
student_interests
ai_conversations
ai_messages
audit_logs
```

The final schema may split or combine entities where justified during
database design.

------------------------------------------------------------------------

# 26. Data Integrity Requirements

### FR-DATA-001

Primary keys shall uniquely identify records.

### FR-DATA-002

Foreign-key relationships shall be enforced where appropriate.

### FR-DATA-003

Required fields shall be validated.

### FR-DATA-004

Duplicate records shall be prevented where uniqueness is required.

### FR-DATA-005

Status transitions shall follow valid state rules.

### FR-DATA-006

Deleted/deactivated institutional content should not unexpectedly break
historical records.

### FR-DATA-007

Timestamps shall be stored consistently.

------------------------------------------------------------------------

# 27. API Requirements

The first API architecture shall use REST.

## Example endpoints

``` text
GET    /api/dashboard

GET    /api/timetable
GET    /api/attendance
GET    /api/subjects
GET    /api/assignments
GET    /api/exams
GET    /api/results

GET    /api/locations
GET    /api/locations/:id
GET    /api/facilities

GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/:id/save

GET    /api/events
GET    /api/events/:id
POST   /api/events/:id/register

GET    /api/services
POST   /api/service-requests
GET    /api/service-requests/:id

POST   /api/issues
GET    /api/issues/:id
PATCH  /api/issues/:id/status

GET    /api/notifications
PATCH  /api/notifications/:id/read

POST   /api/ai/chat

GET    /api/admin/analytics
```

The final API contract shall be documented before production
implementation.

------------------------------------------------------------------------

# 28. API Security Requirements

### FR-API-001

All protected API endpoints shall validate authentication.

### FR-API-002

All protected API endpoints shall validate authorization.

### FR-API-003

Request bodies shall be schema-validated.

### FR-API-004

Query parameters shall be validated.

### FR-API-005

The server shall never trust client-supplied role values.

### FR-API-006

Sensitive database fields shall not be returned unnecessarily.

### FR-API-007

API keys and service credentials shall not be exposed to the browser.

### FR-API-008

Unexpected errors shall not expose internal stack traces.

------------------------------------------------------------------------

# 29. Error Handling Requirements

The system shall provide consistent error responses.

Example:

``` json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

Common error categories:

``` text
BAD_REQUEST
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
VALIDATION_ERROR
RATE_LIMITED
INTERNAL_ERROR
```

Frontend must translate errors into understandable user messages.

------------------------------------------------------------------------

# 30. Frontend Requirements

The frontend shall:

-   use TypeScript,
-   use reusable components,
-   use route-based code organization,
-   support responsive layouts,
-   provide loading states,
-   provide empty states,
-   provide error states,
-   provide authorization-aware navigation,
-   avoid unnecessary duplicated logic.

Recommended feature structure:

``` text
features/
├── auth/
├── dashboard/
├── academics/
├── campus/
├── opportunities/
├── career/
├── events/
├── services/
├── notifications/
├── ai/
└── admin/
```

------------------------------------------------------------------------

# 31. UI Component Requirements

The shared UI library should include:

-   AppShell
-   Sidebar
-   Topbar
-   PageHeader
-   Breadcrumbs
-   Card
-   StatCard
-   DataTable
-   Tabs
-   Badge
-   Button
-   Input
-   Select
-   Form
-   Modal
-   Drawer
-   Toast
-   Dropdown
-   Search
-   FilterBar
-   Pagination
-   EmptyState
-   Skeleton
-   ErrorState
-   MapContainer
-   LocationCard
-   StatusTimeline
-   NotificationItem
-   ChartCard

Components should be reusable and configurable rather than copied across
pages.

------------------------------------------------------------------------

# 32. Responsive Requirements

The application shall support:

-   mobile,
-   tablet,
-   desktop.

Minimum expectations:

### Mobile

-   usable navigation,
-   readable tables or responsive alternatives,
-   touch-friendly controls,
-   map usable on small screens.

### Tablet

-   adaptive layout,
-   appropriate sidebar/navigation behavior.

### Desktop

-   full dashboard layout,
-   multi-column information where useful,
-   efficient administrative tables.

------------------------------------------------------------------------

# 33. Accessibility Requirements

The application should follow accessibility best practices.

Requirements include:

-   semantic HTML,
-   keyboard navigation,
-   visible focus states,
-   sufficient color contrast,
-   accessible form labels,
-   meaningful alt text,
-   error messages associated with form fields,
-   logical heading hierarchy.

------------------------------------------------------------------------

# 34. Performance Requirements

The system should be designed for responsive normal usage.

Requirements:

-   optimize images,
-   paginate large datasets,
-   avoid unnecessary API requests,
-   cache appropriate read-heavy data,
-   lazy-load large modules where useful,
-   avoid N+1 database queries.

The project should not claim enterprise-scale performance without actual
load testing.

------------------------------------------------------------------------

# 35. Security Requirements

## Authentication

-   use a trusted authentication provider,
-   do not manually implement password storage.

## Secrets

-   store secrets in environment variables,
-   never commit secrets,
-   never expose server-only credentials to the frontend.

## Authorization

-   enforce at API/database level,
-   use database policies where appropriate.

## Input Security

-   validate all inputs,
-   sanitize/escape where required,
-   prevent unauthorized file access.

## File Security

Uploaded files must be:

-   associated with an authorized owner/request,
-   subject to size/type restrictions,
-   inaccessible to unauthorized users.

------------------------------------------------------------------------

# 36. Database Security

If Supabase/PostgreSQL is used:

-   enable Row Level Security where appropriate,
-   create policies based on authenticated identity and role,
-   avoid exposing privileged service-role credentials,
-   restrict write operations,
-   separate public and private storage access.

Example conceptual policy:

``` text
Student
  → SELECT own attendance

Faculty
  → SELECT/UPDATE attendance for authorized classes

Admin
  → authorized institutional management
```

------------------------------------------------------------------------

# 37. Audit Requirements

The system should maintain audit logs for sensitive actions.

Potential audited actions:

-   user role changes,
-   academic record changes,
-   announcement publishing,
-   location changes,
-   service status changes,
-   issue resolution,
-   administrative configuration changes.

Audit record should support:

``` text
id
actor_user_id
action
entity_type
entity_id
timestamp
metadata
```

------------------------------------------------------------------------

# 38. File and Media Requirements

Supported media may include:

-   JPG/JPEG,
-   PNG,
-   WebP,
-   PDF where appropriate.

The system should:

-   validate file type,
-   limit file size,
-   generate appropriate storage paths,
-   prevent unauthorized access,
-   optimize images when possible.

Campus images should be stored in object storage rather than inside
database records as binary data.

------------------------------------------------------------------------

# 39. Notification Requirements

The initial system should support in-app notifications.

Possible future channels:

-   email,
-   push notification,
-   SMS.

Notification record:

``` text
id
user_id
type
title
message
read_at
created_at
related_entity_type
related_entity_id
```

------------------------------------------------------------------------

# 40. Logging and Monitoring

The application should log:

-   authentication failures where appropriate,
-   unexpected API errors,
-   important administrative actions,
-   external-service failures.

Logs must not expose passwords, secrets, or unnecessary personal
information.

Production monitoring can be added after the initial deployment.

------------------------------------------------------------------------

# 41. Environment Configuration

Example variables:

``` text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

MAP_PROVIDER_KEY=

API_BASE_URL=
```

Requirements:

-   `.env.local` for local secrets,
-   `.env.example` containing variable names only,
-   production secrets configured through deployment infrastructure.

------------------------------------------------------------------------

# 42. Suggested Repository Structure

``` text
campus-360/
│
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── routes/
│   │       ├── types/
│   │       └── styles/
│   │
│   └── api/
│       └── src/
│           ├── modules/
│           ├── middleware/
│           ├── services/
│           ├── routes/
│           ├── utils/
│           └── config/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
│
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   ├── API.md
│   ├── DATABASE.md
│   └── ARCHITECTURE.md
│
└── README.md
```

For a small student team, a simpler repository is acceptable.
Architecture should be driven by maintainability, not complexity for its
own sake.

------------------------------------------------------------------------

# 43. State Management Requirements

Use server-state management for remote data.

Recommended:

-   TanStack Query for server state,
-   React state/context for local UI state.

Avoid putting all application data into a single global state store.

------------------------------------------------------------------------

# 44. Form Requirements

Forms shall:

-   validate on client,
-   validate again on server,
-   show field-level errors,
-   prevent duplicate submissions,
-   show loading state,
-   show success/failure feedback.

Zod may be used for shared validation schemas.

------------------------------------------------------------------------

# 45. Search Requirements

Search should support relevant campus entities.

Initial searchable entities:

-   locations,
-   facilities,
-   opportunities,
-   events,
-   announcements.

Search should:

-   tolerate normal user input,
-   support empty state,
-   support filtering,
-   paginate large results.

------------------------------------------------------------------------

# 46. Data Seeding Requirements

Development seed data should allow the application to be demonstrated
without real institutional integrations.

Seed data should include examples for:

-   users,
-   departments,
-   subjects,
-   schedules,
-   attendance,
-   opportunities,
-   events,
-   locations,
-   facilities,
-   announcements,
-   services.

Seed data must be clearly marked as demo/development data.

------------------------------------------------------------------------

# 47. Testing Requirements

## 47.1 Unit Testing

Test:

-   validation,
-   calculations,
-   matching algorithm,
-   permission helpers,
-   status transitions.

## 47.2 Integration Testing

Test:

-   authentication,
-   database operations,
-   API endpoints,
-   authorization.

## 47.3 UI Testing

Test critical journeys:

-   login,
-   dashboard,
-   timetable,
-   attendance,
-   campus map,
-   opportunity discovery,
-   service request,
-   issue reporting.

## 47.4 Security Testing

Test:

-   unauthorized access,
-   cross-user access,
-   role escalation,
-   invalid input,
-   protected files,
-   exposed credentials.

------------------------------------------------------------------------

# 48. Acceptance Test Examples

## Test AT-001 --- Student Login

Given a valid student account:

-   login succeeds,
-   student dashboard opens,
-   student navigation is displayed.

## Test AT-002 --- Cross-Student Privacy

Given Student A is authenticated:

-   Student A requests Student B's private attendance,
-   the request must be rejected.

## Test AT-003 --- Faculty Attendance

Given a faculty member is authorized for Class X:

-   faculty can view Class X students,
-   faculty can record attendance,
-   unauthorized classes are inaccessible.

## Test AT-004 --- Campus Location

Given a location exists:

-   user can search it,
-   user can open details,
-   map displays its coordinates.

## Test AT-005 --- Service Request

Given a student submits a service:

-   request ID is generated,
-   request appears in student's history,
-   status begins as Submitted.

## Test AT-006 --- Issue Workflow

Given an issue is submitted:

-   admin can view it,
-   admin can assign it,
-   status can change according to allowed transitions,
-   history is preserved.

## Test AT-007 --- AI Privacy

Given a student asks for another student's private data:

-   AI must not disclose it.

## Test AT-008 --- AI Unknown Data

Given campus information does not exist:

-   assistant must state that the information is unavailable,
-   assistant must not invent an answer.

------------------------------------------------------------------------

# 49. Status Transition Requirements

Service requests:

``` text
DRAFT
SUBMITTED
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
```

Possible alternate:

``` text
REJECTED
CANCELLED
```

Issues:

``` text
REPORTED
TRIAGED
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
```

Invalid transitions must be rejected.

For example:

``` text
CLOSED → IN_PROGRESS
```

should not happen unless an explicit reopening workflow is implemented.

------------------------------------------------------------------------

# 50. Data Ownership Rules

## Student-Owned

-   personal preferences,
-   saved opportunities,
-   event registrations,
-   own service requests,
-   own issue reports.

## Faculty-Owned/Managed

-   assigned academic workflows,
-   authorized attendance,
-   assigned academic content.

## Institution-Owned

-   departments,
-   programs,
-   subjects,
-   campus locations,
-   facilities,
-   official announcements,
-   official events,
-   official opportunities.

------------------------------------------------------------------------

# 51. External Integration Requirements

External systems are optional during the MVP.

Potential future integrations:

-   institutional ERP,
-   LMS,
-   attendance system,
-   placement system,
-   email,
-   SMS,
-   push notifications,
-   campus transport,
-   library system.

Integrations should be introduced through service/API boundaries rather
than tightly coupling external APIs directly into UI components.

------------------------------------------------------------------------

# 52. Deployment Requirements

The application must be deployable using managed services.

Possible deployment:

``` text
Frontend
→ Vercel or equivalent

Backend
→ Node-compatible hosting

Database/Auth/Storage
→ Supabase

AI
→ Gemini API

Maps
→ Selected mapping provider
```

The exact provider can change without changing the product requirements.

------------------------------------------------------------------------

# 53. Backup and Recovery

Production deployment should provide:

-   database backup capability,
-   migration history,
-   recoverable media,
-   environment configuration documentation.

The project should not depend on manually recreating database records.

------------------------------------------------------------------------

# 54. Development Rules

The IDE/coding agent must follow these rules.

## Rule 1

Do not invent official TGPCET information.

## Rule 2

Do not place secrets in frontend source code.

## Rule 3

Do not trust frontend-only authorization.

## Rule 4

Do not create unnecessary pages.

Use drawers, modals, tabs, or detail states when appropriate.

## Rule 5

Do not duplicate shared UI components.

## Rule 6

Every data-driven screen must handle:

-   loading,
-   success,
-   empty,
-   error,
-   unauthorized.

## Rule 7

Use TypeScript.

Avoid `any` unless justified.

## Rule 8

Do not build fake functionality.

If a button exists for a real feature, it should either work or clearly
be marked as unavailable/development-only.

## Rule 9

Implement features vertically:

``` text
UI
 ↓
API
 ↓
Database
 ↓
Authorization
 ↓
Validation
 ↓
Error Handling
 ↓
Testing
```

## Rule 10

Do not implement advanced AI before the underlying data model is
reliable.

------------------------------------------------------------------------

# 55. Definition of Software Done

A software feature is complete when:

-   requirements are implemented,
-   database changes exist where required,
-   API exists where required,
-   authorization exists,
-   validation exists,
-   UI exists,
-   responsive behavior exists,
-   loading state exists,
-   empty state exists,
-   error state exists,
-   tests exist,
-   navigation is connected,
-   documentation is updated.

A frontend-only mockup is not a completed implementation.

------------------------------------------------------------------------

# 56. SRS Traceability

The implementation must remain traceable to the PRD.

  PRD Area             SRS Area
  -------------------- ----------------------------
  Dashboard            Dashboard Requirements
  Academic Hub         Academic Requirements
  Smart Campus Map     Campus Requirements
  Opportunities        Opportunity Requirements
  Placement & Career   Career Requirements
  AI Assistant         AI Requirements
  Student Services     Service Requirements
  Communication        Communication Requirements
  Events & Clubs       Event Requirements
  Safety & Support     Issue Requirements
  Facilities           Facility Requirements
  Analytics            Analytics Requirements

------------------------------------------------------------------------

# 57. Minimum Technical Acceptance Criteria

The software foundation is acceptable when:

1.  Authentication works.
2.  Roles are recognized.
3.  Protected routes are protected.
4.  API authorization works.
5.  Database migrations can be reproduced.
6.  Seed data can populate a development environment.
7.  Core CRUD workflows work.
8.  Sensitive records are protected.
9.  Campus locations can be stored and retrieved.
10. Media can be uploaded securely.
11. Errors are handled consistently.
12. The application is responsive.
13. Critical workflows have tests.
14. Environment configuration is documented.
15. The application can be deployed without manual database
    manipulation.

------------------------------------------------------------------------

# 58. SRS Completion Boundary

This SRS intentionally does not define the final detailed implementation
sequence.

The next engineering document should define:

**Phase 1 --- Product & Technical Foundation**

It should translate this SRS into:

-   development tasks,
-   database migrations,
-   repository setup,
-   environment setup,
-   authentication setup,
-   initial component system,
-   initial routes,
-   seed data,
-   acceptance tests,
-   development checkpoints.

After Phase 1, implementation should proceed incrementally rather than
asking an IDE to generate the complete system at once.

------------------------------------------------------------------------

# 59. Final Technical Principle

The system should follow:

``` text
Reliable Data
      ↓
Secure APIs
      ↓
Role-Based Access
      ↓
Useful UI
      ↓
Connected Workflows
      ↓
Intelligence
```

AI is an enhancement to the platform---not a substitute for correct
data, authorization, architecture, or product design.
