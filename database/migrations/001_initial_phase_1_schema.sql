-- ==========================================================
-- Campus 360 - Phase 1 PostgreSQL Initial Schema Migration
-- ==========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: roles
CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: departments
CREATE TABLE IF NOT EXISTS "departments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: programs
CREATE TABLE IF NOT EXISTS "programs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "degree" VARCHAR(50) NOT NULL,
    "duration_years" INTEGER DEFAULT 4 NOT NULL,
    "department_id" UUID NOT NULL REFERENCES "departments"("id") ON DELETE RESTRICT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: user_roles
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "uq_user_role" UNIQUE ("user_id", "role_id")
);

-- Table: profiles
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "prn" VARCHAR(100) UNIQUE,
    "phone" VARCHAR(20),
    "bio" TEXT,
    "avatar_url" TEXT,
    "semester" INTEGER,
    "year" INTEGER,
    "roll_no" VARCHAR(50),
    "department_id" UUID REFERENCES "departments"("id") ON DELETE SET NULL,
    "program_id" UUID REFERENCES "programs"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for performance & lookups
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_user_roles_user_id" ON "user_roles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_roles_role_id" ON "user_roles"("role_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_prn" ON "profiles"("prn");
CREATE INDEX IF NOT EXISTS "idx_programs_dept_id" ON "programs"("department_id");
