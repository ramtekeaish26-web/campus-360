# Campus 360 — TGPCET Autonomous Campus Platform

**Institution:** Tulsiramji Gaikwad-Patil College of Engineering and Technology (TGPCET), Nagpur  
**Platform:** Campus 360  
**Phase:** Phase 8 — Production Hardening, Security & Judge Readiness (Complete)  
**Version:** 8.0.0  
**Design System:** Academic Vanguard / TGPCET Autonomous

---

## 1. Project Overview

**Campus 360** is a unified, high-performance digital campus operating platform engineered for TGPCET (Autonomous), Nagpur. It consolidates academic management, spatial wayfinding, helpdesk operations, student engagement, campus intelligence analytics, proactive notifications, and AI assistance into a secure, role-based platform.

### Completed Capabilities Across Phases 1–8:
- **Phase 1: Architecture & Foundation**: Supabase Auth + JWT, Express API, PostgreSQL Prisma ORM, Role-Based Access Control (Student, Faculty, Admin), Profile management, Protected routes, Helmet security headers.
- **Phase 2: Academic Core**: Academic Dashboard, Subjects Catalog, Class Schedule & Timetable, Attendance tracking & percentage engine, Coursework Assignments, Exam Schedules, Results & Gradecards (SGPA, letter grades A+ to F, student data isolation), Academic Calendar.
- **Phase 3: Campus Spatial Core & Wayfinding**: Vector campus map, Step-by-step wayfinding engine with accessible/barrier-free routing, Multi-floor buildings directory, Campus facilities & amenities, Room index, QR-accessible location URLs, Admin spatial console.
- **Phase 4: Campus Services & Engagement**:
  - **Notices & Circulars (`/notices`)**: Official institutional announcements with audience targeting, priority tags, and read receipts.
  - **Campus Events & Fests (`/events`)**: Hackathons, workshops with capacity limits, real-time registration/cancellation.
  - **Clubs & Communities (`/clubs`)**: Student organizations (COSC, Robotics, Cultural, Sports) with join/leave workflows.
  - **Campus Helpdesk & Tickets (`/services/requests`)**: Comprehensive service request ticket management linked to physical locations with strict lifecycle state machine (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`), audit history, and comments.
  - **Lost & Found (`/lost-found`)**: Item repository with PII protection (masked student info), claim submission, and admin moderation.
  - **Emergency & Safety (`/emergency`)**: 24/7 security control room, ambulance/health center, fire & anti-ragging contacts with quick-dial actions.
  - **Feedback & Rating**: 1–5 star ratings and reviews for services, events, and facilities.
- **Phase 5: Campus Intelligence & Gemini AI**:
  - Official Google Gen AI SDK (`@google/genai` v2.27.0) configured server-side with prompt-injection defense.
  - Deterministic fallback synthesis when API key is unconfigured.
  - Authoritative tool execution across locations, timetable, attendance, assignments, notices, and service requests.
  - Two-step confirmation for state-mutating actions (service ticket creation).
- **Phase 6: Smart Campus Intelligence & Analytics**:
  - Role-based analytics dashboards (Student personal performance vs. Admin institutional health).
  - Grounded natural language analytics explanation (explains calculated metrics, does not invent data or run raw SQL).
  - CSV export controls restricted to Admin.
- **Phase 7: Proactive Campus Experience & Notifications**:
  - Priority-tiered notifications (`EMERGENCY`, `URGENT`, `NORMAL`, `INFO`) with quiet-hours preference enforcement.
  - Daily Smart Digest generation summarizing deadlines, urgent circulars, and scheduled lectures.
  - Admin institutional broadcast console with target audience preview and audit logging.
- **Phase 8: Production Hardening, Security & Judge Readiness**:
  - Full RBAC data isolation and IDOR defense across all modules.
  - Rate limiting on AI and authentication endpoints.
  - Standardized health check endpoint (`GET /api/health`).
  - Zero frontend or repository secret leakage.
  - 100% passing regression test suite across frontend and backend.

---

## 2. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT / FACULTY / ADMIN                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             React + TypeScript Web Application              │
│       Vite · Tailwind CSS · React Router · TanStack Query   │
│       (Stitch Design Tokens: Academic Vanguard Theme)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (/api/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js + Express API                     │
│      TypeScript · Zod Validation · Helmet · Structured Log  │
│      requireAuth() · requireRole() · requireAnyRole()       │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────────┐    ┌─────────────────┐
│  PostgreSQL  │      │  Supabase Auth   │    │ Google Gen AI   │
│ (Prisma ORM) │      │  JWT Attestation │    │   Gemini SDK    │
└──────────────┘      └──────────────────┘    └─────────────────┘
```

---

## 3. Technology Stack

### Frontend:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 (Academic Vanguard design system tokens, Plus Jakarta Sans, Inter, JetBrains Mono)
- **Routing**: React Router DOM v6 (Protected & Role-based routing)
- **State & Data Fetching**: TanStack React Query v5 & React Context
- **Forms & Validation**: React Hook Form with Zod resolvers
- **Icons**: Lucide React
- **HTTP Client**: Centralized `apiClient` with token management & error mapping

### Backend:
- **Runtime**: Node.js v20+ with TypeScript
- **Framework**: Express 4
- **AI SDK**: `@google/genai` (v2.27.0)
- **ORM & Data Modeling**: Prisma 5 / PostgreSQL
- **Security**: Helmet, CORS, parameterized queries, rate limiting, sanitization
- **Validation**: Zod schema middleware (body, query, params)
- **Logging**: Pino structured logger with `pino-pretty` development transport
- **Error Handling**: Centralized error middleware with safe production sanitization

---

## 4. End-to-End Judge Demonstration Flows

### Flow 1: Student Experience
1. **Login**: Go to `http://localhost:5173/login`, click **Student** tab → **Auto-fill** → Sign In (`student@demo.local`).
2. **Dashboard**: View personal GPA, attendance percentage (85%), upcoming classes, and pending assignments.
3. **Class Schedule**: Navigate to **Timetable** to inspect today's lectures in Academic Block A.
4. **Campus Map & Navigation**: Open **Campus Map**, search for "Library", and click **Route** to calculate walking directions and accessible paths.
5. **Academics**: Check **Attendance breakdown** and view published midterm scorecard with grades.
6. **Campus Services**: Open **Service Requests** and track existing maintenance tickets or report a new one.
7. **Proactive Experience**: Check the **Notifications** center and read the AI-generated **Daily Smart Digest**.
8. **AI Assistant**: Open **Campus AI**, ask *"What classes do I have today?"* or *"Where is the library?"* to test authoritative grounded responses.

### Flow 2: Faculty Portal
1. **Login**: Switch account to `faculty@demo.local` via the login screen.
2. **Dashboard**: View assigned course sections (`CS301`, `CS303`) and student enrollment totals.
3. **Academics**: Review subject syllabi and schedule lecture sessions.
4. **Notices & Events**: Check departmental announcements and upcoming symposiums.
5. **Analytics**: Inspect course-level attendance averages and assignment completion rates.

### Flow 3: Admin Console
1. **Login**: Switch account to `admin@demo.local`.
2. **Executive Dashboard**: Inspect campus-wide operational metrics, active users, and system health.
3. **Spatial Management**: Register campus facilities and manage building metadata.
4. **Institutional Broadcast**: Open **Broadcast Management**, preview targeted audiences, and broadcast campus circulars.
5. **AI Monitoring**: Open **AI Monitoring** to inspect query volumes, tool invocation logs, and prompt-injection defense records.

---

## 5. Demo Credentials

| Role | Email | PRN / Emp ID | Demo Password | Capabilities |
|---|---|---|---|---|
| **Student** | `student@demo.local` | `202201640049281` | `demo123` | Personal academic scorecard, timetable, attendance, map, services, AI assistant |
| **Faculty** | `faculty@demo.local` | `FAC-CSE-104` | `demo123` | Course offerings, lecture management, notices, analytics |
| **Admin** | `admin@demo.local` | `ADM-TGPCET-01` | `demo123` | Institutional analytics, spatial management, user directory, AI audit, broadcast |

---

## 6. Local Setup & Execution

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY` from Google AI Studio to `.env` to enable live cloud inference).*

### Step 3: Initialize Database & Seed Fixtures
```bash
npm run db:generate
npm run db:seed
```

### Step 4: Run Application
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

---

## 7. Testing & Quality Verification

```bash
# Run all tests across workspaces
npm test

# Run backend test suite (17 test files)
npm run test:backend

# Run frontend test suite (9 test suites)
npm run test:frontend

# TypeScript typechecking
npm run typecheck

# Production build
npm run build
```

---

## 8. Backup & Recovery Strategy

1. **Database Snapshot**: Use standard PostgreSQL tools (`pg_dump`) to capture transactional data:
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f campus360_backup.dump
   ```
2. **Database Restore**:
   ```bash
   pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME -v campus360_backup.dump
   ```
3. **Environment Disaster Recovery**: Maintain encrypted configuration vaults for `SUPABASE_JWT_SECRET`, `DATABASE_URL`, and `GEMINI_API_KEY`.
4. **Stateless Scalability**: All frontend and backend application instances are stateless; user sessions are verified via cryptographically signed JWT tokens.

---

## 9. Phase 8 Final Acceptance Checklist

- [x] Full application starts and builds cleanly.
- [x] Frontend & Backend production builds pass without errors.
- [x] Unit, Integration, and RBAC tests passing.
- [x] Student, Faculty, and Admin role-based isolation enforced.
- [x] Gemini client implemented server-side with prompt-injection defense.
- [x] Zero secret leakage in frontend, git repository, or logs.
- [x] Standardized health check endpoint (`/api/health`) active.
- [x] Complete judge demonstration flows verified for all roles.
