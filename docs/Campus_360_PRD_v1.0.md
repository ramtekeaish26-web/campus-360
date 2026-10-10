# CAMPUS 360 --- PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project:** Campus 360\
**Institution Context:** TGPCET Campus\
**Document:** Product Requirements Document\
**Version:** 1.0\
**Status:** Product Blueprint / Development Source of Truth\
**Audience:** Product owner, UI/UX designer, developers, IDE coding
agent, project guide, testers

------------------------------------------------------------------------

# 1. Executive Summary

Campus 360 is a unified digital campus platform designed for TGPCET that
brings together academic information, campus navigation, student
services, opportunities, events, communication, facilities, and
intelligent assistance in one system.

The product is designed around three ideas:

> **Know the Campus. Know the Student. Connect the Two.**

Campus 360 is not intended to replace the complete institutional ERP
during the first release. Instead, it acts as a modern campus experience
layer that connects information and workflows that are normally
fragmented across portals, notices, spreadsheets, departments, maps, and
manual processes.

The platform has three primary user roles:

-   Student
-   Faculty
-   Admin

The student is the primary consumer. Faculty members manage academic
interactions relevant to their responsibilities. Administrators manage
the platform's institutional content, workflows, users, campus
information, and analytics.

The product should feel like a real campus platform rather than a
collection of unrelated dashboard pages.

------------------------------------------------------------------------

# 2. Product Vision

## 2.1 Vision Statement

Create a single digital representation of the campus that helps users
access information, navigate the physical campus, complete campus
services, discover opportunities, communicate, and make better academic
and career decisions.

## 2.2 Product Promise

Campus 360 should answer four practical questions:

1.  **What do I need to know?**
2.  **Where do I need to go?**
3.  **What do I need to do?**
4.  **What should I do next?**

Examples:

-   A student can see today's next class and locate the classroom.
-   A student can check attendance without searching through multiple
    systems.
-   A student can find an internship relevant to their branch and
    skills.
-   A student can submit a campus service request and track it.
-   A student can ask the Campus Assistant where a facility is located.
-   An administrator can see unresolved campus issues and manage them.

------------------------------------------------------------------------

# 3. Product Principles

## 3.1 Useful Before Impressive

Every feature must solve a recognizable campus problem.

## 3.2 Real Data Before Artificial Intelligence

AI should operate on verified campus/application data whenever possible.

## 3.3 One Source of Truth

Shared information such as locations, events, opportunities, and
announcements should come from centralized application data rather than
duplicated hard-coded values.

## 3.4 Role-Based Experience

Students, faculty, and admins should not see the same application.

## 3.5 Action-Oriented Design

The interface should help users complete tasks, not only display
information.

## 3.6 Campus-Specific

The product should feel designed for TGPCET rather than looking like a
generic ERP template.

## 3.7 Honest Data

Unknown or unavailable information must not be fabricated or presented
as real institutional data.

## 3.8 Progressive Intelligence

The platform should first establish reliable data and workflows, then
add AI and recommendation features.

------------------------------------------------------------------------

# 4. Problem Statement

Campus information and services can be fragmented across:

-   academic systems,
-   department notices,
-   faculty communication,
-   spreadsheets,
-   physical notice boards,
-   messaging platforms,
-   separate event information,
-   separate opportunity sources,
-   campus maps,
-   manual service requests.

This creates several problems.

### For students

-   Difficult to find the right information.
-   Difficult for new students to understand the campus.
-   Repeatedly asking where facilities/departments are located.
-   Difficulty discovering relevant opportunities.
-   Limited visibility into service-request status.
-   Information overload from irrelevant notices.

### For faculty

-   Repetitive communication.
-   Fragmented student/academic workflows.
-   Manual attendance and assignment-related tasks.
-   Difficulty managing relevant student interactions.

### For administration

-   Manual request tracking.
-   Fragmented campus issue reporting.
-   Difficulty understanding engagement.
-   Content management spread across multiple channels.
-   Limited centralized visibility.

Campus 360 addresses these problems through one role-aware platform.

------------------------------------------------------------------------

# 5. Target Users

## 5.1 Primary User --- Student

The student should receive the most complete self-service experience.

### Student needs

-   academic information,
-   timetable,
-   attendance,
-   assignments,
-   examinations/results,
-   campus navigation,
-   facilities,
-   opportunities,
-   placements/career information,
-   events,
-   services,
-   notifications,
-   personalized recommendations.

------------------------------------------------------------------------

## 5.2 Secondary User --- Faculty

Faculty needs an operational academic interface.

### Faculty needs

-   class schedule,
-   assigned subjects,
-   students,
-   attendance,
-   assignments,
-   communication,
-   selected requests,
-   relevant analytics.

------------------------------------------------------------------------

## 5.3 System Manager --- Admin

Admin manages the platform and institutional content.

### Admin needs

-   users,
-   departments,
-   academic data,
-   locations,
-   facilities,
-   events,
-   opportunities,
-   announcements,
-   services,
-   complaints/issues,
-   analytics,
-   system configuration.

------------------------------------------------------------------------

# 6. Product Scope

Campus 360 will initially contain 12 major modules.

1.  Campus Dashboard
2.  Academic Hub
3.  Smart Campus Map
4.  Student Opportunities
5.  Placement & Career
6.  AI Campus Assistant
7.  Digital Student Services
8.  Campus Communication
9.  Events & Clubs
10. Safety & Support
11. Campus Facilities
12. Admin Analytics

------------------------------------------------------------------------

# 7. Module Requirements

# M01 --- Campus Dashboard

The dashboard is the primary entry point.

It must be personalized according to the authenticated user's role.

## Student Dashboard

Should show:

-   profile summary,
-   today's timetable,
-   next class,
-   attendance snapshot,
-   upcoming exam,
-   announcements,
-   upcoming events,
-   recommended opportunities,
-   pending service requests,
-   important alerts,
-   quick actions.

## Faculty Dashboard

Should show:

-   today's classes,
-   pending attendance,
-   upcoming assignments,
-   announcements,
-   pending requests,
-   quick actions.

## Admin Dashboard

Should show:

-   active users,
-   pending service requests,
-   unresolved issues,
-   events,
-   announcements,
-   opportunity activity,
-   high-level analytics.

------------------------------------------------------------------------

# M02 --- Academic Hub

The Academic Hub provides academic information in one place.

## Features

-   academic overview,
-   timetable,
-   subjects,
-   attendance,
-   assignments,
-   exams,
-   results,
-   academic calendar,
-   study resources where available.

## Product rules

Students can view their own academic records.

Faculty can manage only the academic information for which they are
authorized.

Admins can manage institutional academic data according to their
permissions.

The system must not expose another student's private academic
information.

------------------------------------------------------------------------

# M03 --- Smart Campus Map

The Smart Campus Map connects digital information with the physical
campus.

## Features

-   campus overview,
-   location search,
-   category filtering,
-   building information,
-   department information,
-   room/lab information,
-   facility information,
-   photos,
-   coordinates,
-   external map directions where appropriate.

## Location categories

-   Building
-   Department
-   Classroom
-   Laboratory
-   Office
-   Library
-   Seminar Hall
-   Canteen
-   Sports Facility
-   Hostel
-   Parking
-   Medical/Support
-   Other

## Product principle

The map should not claim indoor turn-by-turn navigation unless actual
indoor mapping/positioning is implemented.

------------------------------------------------------------------------

# M04 --- Student Opportunities

This module helps students discover opportunities.

## Opportunity types

-   internships,
-   hackathons,
-   competitions,
-   workshops,
-   certifications,
-   scholarships,
-   technical events,
-   volunteering,
-   ambassador programs.

## Features

-   browse,
-   search,
-   filters,
-   eligibility,
-   deadlines,
-   save opportunity,
-   external application link,
-   personalized recommendations.

------------------------------------------------------------------------

# M05 --- Placement & Career

## Features

-   placement announcements,
-   company opportunities,
-   placement drives,
-   eligibility,
-   deadlines,
-   preparation resources,
-   career profile,
-   placement information where authorized.

The first release may use manually maintained information rather than
direct institutional integrations.

------------------------------------------------------------------------

# M06 --- AI Campus Assistant

The AI assistant is a campus-specific assistant rather than a generic
chatbot.

## Example queries

-   Where is the central library?
-   Where is the CSE department?
-   What is my next class?
-   How do I submit a service request?
-   What events are happening this week?
-   Which opportunities match my skills?

## Product behavior

The assistant should:

1.  Understand the user's request.
2.  Determine what campus/application data is required.
3.  Retrieve only information the user is authorized to access.
4.  Generate a useful answer.
5.  Provide an action or navigation option when appropriate.
6.  Clearly indicate when information is unavailable.

## Critical requirement

The AI must not invent official campus information.

------------------------------------------------------------------------

# M07 --- Digital Student Services

This module digitizes selected campus workflows.

## Initial service types

-   bonafide request,
-   document request,
-   leave request,
-   general service request,
-   feedback,
-   grievance/issue.

## Request lifecycle

``` text
Draft
  ↓
Submitted
  ↓
Assigned
  ↓
In Progress
  ↓
Completed / Resolved
  ↓
Closed
```

Possible alternate states:

-   Rejected
-   Cancelled

## Student experience

Students should be able to:

-   select service,
-   fill form,
-   attach required information,
-   submit,
-   receive request ID,
-   track status,
-   view status history.

------------------------------------------------------------------------

# M08 --- Campus Communication

Centralizes campus communication.

## Features

-   announcements,
-   department notices,
-   notifications,
-   targeted alerts,
-   important notices.

## Targeting

Announcements may target:

-   everyone,
-   students,
-   faculty,
-   department,
-   year,
-   section,
-   role.

The system should reduce irrelevant information rather than simply
broadcasting everything.

------------------------------------------------------------------------

# M09 --- Events & Clubs

## Features

-   event discovery,
-   event details,
-   organizer,
-   date/time,
-   venue,
-   registration,
-   capacity,
-   club directory,
-   participation history.

The module should make campus life discoverable rather than hiding
events in separate notices.

------------------------------------------------------------------------

# M10 --- Safety & Support

## Features

-   emergency contacts,
-   issue reporting,
-   lost and found,
-   support information,
-   campus maintenance reporting.

## Issue lifecycle

``` text
Reported
  ↓
Triaged
  ↓
Assigned
  ↓
In Progress
  ↓
Resolved
  ↓
Closed
```

A reported issue should be associated with a location whenever possible.

------------------------------------------------------------------------

# M11 --- Campus Facilities

Provides a searchable facility directory.

## Facilities can include

-   library,
-   canteen,
-   laboratories,
-   sports,
-   hostel,
-   transport,
-   parking,
-   medical/support facilities,
-   administrative facilities.

## Facility information

Where verified, a facility can contain:

-   name,
-   description,
-   location,
-   photos,
-   opening hours,
-   contact,
-   services offered.

The platform must not display live availability unless a real data
source exists.

------------------------------------------------------------------------

# M12 --- Admin Analytics

Admin analytics provide a high-level view of platform activity.

## Possible metrics

-   active users,
-   service requests,
-   request resolution time,
-   unresolved issues,
-   event participation,
-   opportunity engagement,
-   attendance aggregates,
-   placement metrics,
-   content activity.

Analytics must respect privacy and permissions.

------------------------------------------------------------------------

# 8. Innovation Strategy

The product should have meaningful innovation rather than adding AI only
for appearance.

## 8.1 Student Growth Profile

A student's profile can gradually contain:

-   academic information,
-   skills,
-   projects,
-   certifications,
-   events,
-   clubs,
-   competitions,
-   internships,
-   interests,
-   career goals.

This becomes the basis for personalization.

------------------------------------------------------------------------

## 8.2 Opportunity Matching

Campus 360 can compare a student's profile against opportunities.

Example:

``` text
Student
  ↓
Branch + Year
  ↓
Skills
  ↓
Interests
  ↓
Eligibility
  ↓
Opportunity Matching
  ↓
Recommended Opportunities
```

The result should include a match score and reasons.

Example:

> 92% Match\
> Branch eligible\
> Required Python skill matched\
> Interest aligned\
> Year eligible

The score must be explainable and must not imply guaranteed selection.

------------------------------------------------------------------------

## 8.3 Student Risk Radar

The initial version should be rule-based rather than pretending to have
a sophisticated predictive model.

Possible indicators:

-   low attendance,
-   missing assignments,
-   declining performance,
-   inactivity.

The output should be an attention indicator.

Example:

> Attendance in Subject X is below the configured threshold.

Avoid claims such as:

> "This student will fail."

------------------------------------------------------------------------

## 8.4 Campus Issue Intelligence

Aggregated issue data can identify:

-   frequently reported locations,
-   common issue categories,
-   average resolution time,
-   unresolved backlog,
-   recurring problems.

This turns issue reporting into a campus improvement tool.

------------------------------------------------------------------------

# 9. MVP Definition

The MVP should be realistic and demonstrable.

## Student MVP

-   Login
-   Dashboard
-   Profile
-   Timetable
-   Attendance
-   Subjects
-   Exams/results
-   Announcements
-   Campus map
-   Location details
-   Opportunities
-   Events
-   Services
-   Notifications

## Faculty MVP

-   Login
-   Dashboard
-   Timetable/classes
-   Attendance
-   Students
-   Assignments
-   Announcements

## Admin MVP

-   Login
-   Dashboard
-   User management
-   Academic data management
-   Campus location management
-   Announcements
-   Events
-   Opportunities
-   Service requests
-   Issues
-   Basic analytics

------------------------------------------------------------------------

# 10. Advanced Release

The following should be added after the core MVP is stable:

1.  AI Campus Assistant
2.  Opportunity Matching
3.  Student Growth Profile
4.  Risk Radar
5.  Campus Issue Intelligence
6.  Advanced analytics
7.  Better search
8.  Document/RAG knowledge base
9.  External institutional integrations

The advanced layer should not delay the core product.

------------------------------------------------------------------------

# 11. Out of Scope for Initial Release

Campus 360 should not attempt to implement all institutional technology
immediately.

Explicitly out of scope:

-   complete ERP replacement,
-   fee/payment processing,
-   biometric attendance hardware,
-   facial recognition,
-   autonomous indoor positioning,
-   live bus GPS without a real feed,
-   live classroom occupancy without a real feed,
-   replacement of the official LMS,
-   complete institutional-system replacement,
-   high-stakes autonomous academic decisions.

These can be future integration points.

------------------------------------------------------------------------

# 12. Data Strategy

Campus 360 will use three types of data.

## 12.1 Verified Institutional Data

Examples:

-   campus locations,
-   building names,
-   departments,
-   facility details,
-   official contacts,
-   official announcements,
-   approved events.

This data should be verified before being presented as official.

## 12.2 Application-Generated Data

Examples:

-   service requests,
-   issue reports,
-   registrations,
-   notifications,
-   saved opportunities,
-   status histories,
-   user preferences.

## 12.3 Development Seed Data

Used for development/demo:

-   sample students,
-   sample timetable,
-   sample attendance,
-   sample opportunities,
-   sample events.

Seed data must never be confused with real institutional data.

------------------------------------------------------------------------

# 13. Campus Map Product Strategy

The campus map is a major differentiator and should have its own
structured data.

Each important location should have:

-   unique ID,
-   name,
-   category,
-   building,
-   floor,
-   room,
-   description,
-   coordinates,
-   image,
-   contact where applicable,
-   operating hours where verified.

## Photo acquisition

The project should use:

-   actual campus photographs,
-   photographs taken by the project team with permission,
-   official photographs where permission is available.

Do not use AI-generated images as if they were photographs of real
campus locations.

## Location collection

Recommended workflow:

1.  Obtain an official campus/site plan if available.
2.  List required locations.
3.  Physically verify important locations.
4.  Record coordinates.
5.  Record building/floor/room information.
6.  Verify naming with official sources.
7.  Upload photos.
8.  Store the data through the admin system.

------------------------------------------------------------------------

# 14. Student Profile Strategy

The student profile should grow beyond basic identity information.

Initial profile:

-   name,
-   student ID/roll number,
-   department,
-   program,
-   year,
-   section.

Future profile:

-   skills,
-   projects,
-   certifications,
-   interests,
-   events,
-   clubs,
-   competitions,
-   internships,
-   career interests.

This profile becomes the basis for opportunity recommendations and
personalized campus experiences.

------------------------------------------------------------------------

# 15. Role Experience

Campus 360 must not simply hide menu items. Permissions must be enforced
at the data/action level.

## Student

Can:

-   view own data,
-   submit requests,
-   report issues,
-   browse campus information,
-   save opportunities,
-   register for events.

Cannot:

-   edit institutional academic records,
-   manage users,
-   manage campus locations,
-   resolve other users' requests.

## Faculty

Can:

-   view authorized classes,
-   manage authorized attendance,
-   manage assigned academic content,
-   communicate with authorized audiences.

Cannot:

-   manage all system users,
-   access unrelated student private data,
-   change global platform settings.

## Admin

Can manage institutional/platform data according to assigned
administrative permissions.

------------------------------------------------------------------------

# 16. Core User Journeys

## Journey A --- Find Next Class

``` text
Login
 ↓
Dashboard
 ↓
Today's Timetable
 ↓
Next Class
 ↓
Location
 ↓
Campus Map
```

## Journey B --- Find Opportunity

``` text
Dashboard
 ↓
Opportunities
 ↓
Search / Filters
 ↓
Opportunity Details
 ↓
Eligibility
 ↓
Save / Apply
```

## Journey C --- Report Campus Issue

``` text
Report Issue
 ↓
Select Location
 ↓
Describe Problem
 ↓
Submit
 ↓
Receive Request ID
 ↓
Track Status
```

## Journey D --- Request Service

``` text
Services
 ↓
Select Service
 ↓
Complete Form
 ↓
Submit
 ↓
Track Status
```

## Journey E --- Ask Campus Assistant

``` text
AI Assistant
 ↓
Question
 ↓
Identify Intent
 ↓
Retrieve Authorized Data
 ↓
Generate Answer
 ↓
Action / Navigation
```

## Journey F --- Student Opportunity Recommendation

``` text
Student Profile
 ↓
Skills + Interests + Academic Context
 ↓
Eligibility Filtering
 ↓
Opportunity Matching
 ↓
Recommendation
 ↓
Student Action
```

------------------------------------------------------------------------

# 17. Product Navigation

The application should have separate role-aware navigation.

## Student Navigation

``` text
Dashboard
Academics
Campus
Opportunities
Career
Events
Services
Notifications
AI Assistant
Profile
```

## Faculty Navigation

``` text
Dashboard
Classes
Attendance
Students
Assignments
Communication
Profile
```

## Admin Navigation

``` text
Dashboard
Users
Departments
Academics
Campus
Facilities
Events
Opportunities
Services
Issues
Announcements
Analytics
Settings
```

The final navigation should be validated during the Information
Architecture phase.

------------------------------------------------------------------------

# 18. Screen Strategy

The project should target approximately 30--35 meaningful screens rather
than creating a separate page for every small action.

## Student screens

1.  Dashboard
2.  Academic Overview
3.  Timetable
4.  Attendance
5.  Subjects
6.  Assignments
7.  Exams & Results
8.  Opportunities
9.  Opportunity Details
10. Placement/Career
11. Campus Map
12. Location Details
13. Events
14. Event Details
15. Services
16. Service Request Details
17. Notifications
18. AI Assistant
19. Profile
20. Settings

## Faculty screens

21. Faculty Dashboard
22. Classes/Timetable
23. Attendance Management
24. Student/Class Details
25. Assignments/Communication

## Admin screens

26. Admin Dashboard
27. User Management
28. Academic Management
29. Campus/Location Management
30. Service & Issue Management
31. Events/Opportunities Management
32. Announcements
33. Analytics

Additional screens can be introduced only when they represent a real
workflow.

------------------------------------------------------------------------

# 19. UX Requirements

The product should look like a premium institutional application.

## Desired characteristics

-   clear hierarchy,
-   professional typography,
-   consistent spacing,
-   strong information density where appropriate,
-   restrained color system,
-   reusable cards,
-   clear tables,
-   meaningful data visualization,
-   responsive layouts,
-   fast navigation.

## Avoid

-   excessive gradients,
-   unnecessary glassmorphism,
-   excessive animation,
-   too many accent colors,
-   generic AI dashboard styling,
-   decorative UI that hides important information.

## Required interface states

Every data-driven feature should account for:

-   loading,
-   success,
-   empty,
-   error,
-   unauthorized.

------------------------------------------------------------------------

# 20. Success Metrics

The project should measure success using practical metrics.

## Product usability

-   users can reach important information quickly,
-   key workflows require minimal unnecessary steps,
-   mobile usability is acceptable.

## Service efficiency

-   requests can be submitted digitally,
-   users can track request status,
-   administrators can see unresolved requests.

## Campus discovery

-   important locations are searchable,
-   location details are understandable,
-   campus information is centralized.

## Opportunity discovery

-   students can find opportunities,
-   filters reduce irrelevant results,
-   recommendations provide useful reasons.

## System quality

-   role permissions work,
-   protected data is not exposed,
-   application is deployable,
-   major workflows are tested.

------------------------------------------------------------------------

# 21. Product Risks

## Risk 1 --- Too Much Scope

### Mitigation

Freeze MVP and postpone advanced features.

## Risk 2 --- Fake/Unavailable Institutional Data

### Mitigation

Separate verified, application-generated, and seed data.

## Risk 3 --- AI Hallucination

### Mitigation

Use structured retrieval, authorization, and explicit uncertainty
handling.

## Risk 4 --- Generic-Looking Product

### Mitigation

Use actual campus information, real location data, real workflows, and a
consistent design system.

## Risk 5 --- UI Without Backend

### Mitigation

Treat a feature as complete only when UI, data, authorization, and
workflow are connected.

## Risk 6 --- Overengineering

### Mitigation

Use a simple architecture first and introduce advanced infrastructure
only when justified.

------------------------------------------------------------------------

# 22. Product Acceptance Criteria

Campus 360 MVP is product-ready when:

1.  Student, Faculty, and Admin roles exist.
2.  Each role has a relevant dashboard.
3.  Role permissions are enforced.
4.  Students can access their academic information.
5.  Faculty can perform authorized academic workflows.
6.  Admin can manage major platform content.
7.  Campus locations are searchable.
8.  Important locations have verified/demo coordinates clearly
    identified.
9.  Campus images can be associated with locations.
10. Students can submit and track services.
11. Students can report issues.
12. Admin can process issues.
13. Students can discover events and opportunities.
14. Announcements/notifications work.
15. The UI is responsive.
16. Empty/error/loading states exist.
17. Sensitive data is protected.
18. AI, when enabled, does not fabricate unavailable campus information.
19. The application can be deployed.
20. Product and technical documentation exists.

------------------------------------------------------------------------

# 23. Definition of Product Done

A product feature is considered complete only when:

-   the user problem is clearly addressed,
-   the UI is implemented,
-   the workflow is functional,
-   required data exists,
-   permissions are correct,
-   validation exists,
-   loading/empty/error states exist,
-   the feature works on supported screen sizes,
-   the feature is connected to the appropriate navigation,
-   the feature has been tested.

A static screen with fake buttons is not considered a completed feature.

------------------------------------------------------------------------

# 24. Product Roadmap Summary

``` text
CAMPUS 360
│
├── FOUNDATION
│   ├── Product Definition
│   ├── Information Architecture
│   └── Design System
│
├── CORE EXPERIENCE
│   ├── Authentication
│   ├── Dashboard
│   ├── Academics
│   ├── Communication
│   └── Notifications
│
├── SMART CAMPUS
│   ├── Campus Map
│   ├── Locations
│   └── Facilities
│
├── CAMPUS SERVICES
│   ├── Service Requests
│   ├── Issue Reporting
│   └── Events
│
├── CAREER
│   ├── Opportunities
│   ├── Placement
│   └── Student Growth Profile
│
└── INTELLIGENCE
    ├── AI Campus Assistant
    ├── Opportunity Matching
    ├── Risk Radar
    └── Campus Issue Intelligence
```

------------------------------------------------------------------------

# 25. Final Product Direction

Campus 360 should ultimately feel like:

> **A digital operating layer for the campus experience.**

The strongest product loop is:

``` text
CAMPUS DATA
     ↓
STUDENT / FACULTY CONTEXT
     ↓
PERSONALIZED EXPERIENCE
     ↓
ACTION
     ↓
NEW DATA
     ↓
BETTER PERSONALIZATION
```

For example:

``` text
Timetable
   ↓
Next Class
   ↓
Classroom Location
   ↓
Campus Map
   ↓
Navigation
```

And:

``` text
Student Profile
   ↓
Skills + Interests
   ↓
Opportunity Matching
   ↓
Recommendation
   ↓
Student Action
   ↓
Profile Growth
```

And:

``` text
Campus Issue
   ↓
Location
   ↓
Admin Assignment
   ↓
Resolution
   ↓
Analytics
   ↓
Campus Improvement
```

These connected workflows---not the number of screens---are what make
Campus 360 a meaningful product.

------------------------------------------------------------------------

# 26. PRD Approval Gate

Before development begins, the following must be approved:

-   product vision,
-   user roles,
-   12-module scope,
-   MVP boundary,
-   advanced-feature boundary,
-   screen strategy,
-   campus map strategy,
-   student profile strategy,
-   innovation strategy,
-   data strategy.

After approval, the next product document should be:

**Phase 2 --- Information Architecture Specification**

That document should convert this PRD into an exact sitemap, route
structure, navigation model, screen inventory, and role-to-screen
mapping.
