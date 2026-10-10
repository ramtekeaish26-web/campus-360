-- ==========================================================
-- Campus 360 - Phase 1 Seed Data
-- 3 Roles, at least 2 Departments, at least 2 Programs,
-- 3 Demo Users (student@demo.local, faculty@demo.local, admin@demo.local)
-- 3 Profiles, 3 Role assignments
-- ==========================================================

-- 1. Insert Roles
INSERT INTO "roles" ("id", "code", "name", "description")
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'STUDENT', 'Student', 'Enrolled student with academic and campus access'),
  ('a0000000-0000-0000-0000-000000000002', 'FACULTY', 'Faculty Member', 'Academic faculty member managing courses and attendance'),
  ('a0000000-0000-0000-0000-000000000003', 'ADMIN', 'Institutional Administrator', 'Platform administrator and examination cell management')
ON CONFLICT ("code") DO NOTHING;

-- 2. Insert Departments
INSERT INTO "departments" ("id", "code", "name", "description")
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering', 'Department of Computer Science & Engineering at TGPCET'),
  ('b0000000-0000-0000-0000-000000000002', 'MECH', 'Mechanical Engineering', 'Department of Mechanical Engineering at TGPCET')
ON CONFLICT ("code") DO NOTHING;

-- 3. Insert Programs
INSERT INTO "programs" ("id", "code", "name", "degree", "duration_years", "department_id")
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'BTECH_CSE', 'B.Tech in Computer Science & Engineering', 'Bachelor of Technology', 4, 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'BTECH_MECH', 'B.Tech in Mechanical Engineering', 'Bachelor of Technology', 4, 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT ("code") DO NOTHING;

-- 4. Insert Demo Users
INSERT INTO "users" ("id", "email", "is_active")
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'student@demo.local', TRUE),
  ('d0000000-0000-0000-0000-000000000002', 'faculty@demo.local', TRUE),
  ('d0000000-0000-0000-0000-000000000003', 'admin@demo.local', TRUE)
ON CONFLICT ("email") DO NOTHING;

-- 5. Insert User Profiles
INSERT INTO "profiles" ("id", "user_id", "first_name", "last_name", "prn", "phone", "bio", "avatar_url", "semester", "year", "roll_no", "department_id", "program_id")
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Aarav',
    'Deshmukh',
    '202201640049281',
    '+91 98765 43210',
    'Final-Year B.Tech Candidate (CSE) • IoT, Distributed Systems & Edge Computing Lead',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    6,
    3,
    'CSE-62',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'Dr. Rajesh',
    'Sharma',
    'FAC-CSE-104',
    '+91 98765 43211',
    'Associate Professor, Department of Computer Science & Engineering',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    NULL,
    NULL,
    NULL,
    'b0000000-0000-0000-0000-000000000001',
    NULL
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000003',
    'Admin',
    'Officer',
    'ADM-TGPCET-01',
    '+91 98765 43212',
    'Autonomous Examination Cell & Systems Administrator',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    NULL,
    NULL,
    NULL,
    'b0000000-0000-0000-0000-000000000001',
    NULL
  )
ON CONFLICT ("user_id") DO NOTHING;

-- 6. Assign Roles
INSERT INTO "user_roles" ("id", "user_id", "role_id")
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'), -- Student
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'), -- Faculty
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003')  -- Admin
ON CONFLICT ("user_id", "role_id") DO NOTHING;
