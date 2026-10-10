-- =========================================================
-- Campus 360 - Phase 2 Academic Core PostgreSQL Migration
-- =========================================================

-- 1. Academic Terms
CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT NOT NULL DEFAULT 4,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    semester INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course Offerings
CREATE TABLE IF NOT EXISTS course_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
    section_name VARCHAR(50) NOT NULL DEFAULT 'A',
    faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, academic_term_id, section_name)
);

-- 4. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE(student_id, course_offering_id)
);

-- 5. Class Schedules
CREATE TABLE IF NOT EXISTS class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    room VARCHAR(100) NOT NULL,
    building VARCHAR(100) NOT NULL DEFAULT 'Academic Block A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    topic VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- 8. Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_marks DOUBLE PRECISION NOT NULL DEFAULT 100,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    marks DOUBLE PRECISION,
    feedback TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- 10. Exams
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    room VARCHAR(100) NOT NULL,
    max_marks DOUBLE PRECISION NOT NULL DEFAULT 100,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    marks_obtained DOUBLE PRECISION NOT NULL,
    grade VARCHAR(10) NOT NULL,
    remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id)
);

-- 12. Academic Calendar Events
CREATE TABLE IF NOT EXISTS academic_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'ALL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
