-- ============================================================
-- CAMPUS 360 — PHASE 3: CAMPUS SPATIAL CORE, MAP & WAYFINDING
-- Migration: 003_phase_3_spatial_core.sql
-- ============================================================

-- 1. Campuses
CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    boundary JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buildings
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    building_type VARCHAR(50) DEFAULT 'ACADEMIC',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Floors
CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor_number INT NOT NULL,
    display_order INT DEFAULT 0,
    floor_plan TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, floor_number)
);

-- 4. Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) DEFAULT 'CLASSROOM',
    description TEXT,
    capacity INT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(floor_id, room_number)
);

-- 5. Location Categories
CREATE TABLE IF NOT EXISTS location_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Campus Places
CREATE TABLE IF NOT EXISTS campus_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES location_categories(id) ON DELETE RESTRICT,
    building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry JSONB,
    phone VARCHAR(50),
    email VARCHAR(150),
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Place Facilities
CREATE TABLE IF NOT EXISTS place_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES campus_places(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(place_id, facility_id)
);

-- 9. Building Facilities
CREATE TABLE IF NOT EXISTS building_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, facility_id)
);

-- 10. Entrances
CREATE TABLE IF NOT EXISTS entrances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) DEFAULT 'MAIN',
    accessibility_status BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Campus Paths
CREATE TABLE IF NOT EXISTS campus_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    geometry JSONB NOT NULL,
    path_type VARCHAR(50) DEFAULT 'WALKWAY',
    accessible BOOLEAN DEFAULT TRUE,
    surface VARCHAR(100),
    length_meters DOUBLE PRECISION DEFAULT 0,
    start_node VARCHAR(100),
    end_node VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Location Images
CREATE TABLE IF NOT EXISTS location_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES campus_places(id) ON DELETE CASCADE,
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    caption TEXT,
    sort_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient spatial and text searches
CREATE INDEX IF NOT EXISTS idx_buildings_campus ON buildings(campus_id);
CREATE INDEX IF NOT EXISTS idx_floors_building ON floors(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_campus_places_category ON campus_places(category_id);
CREATE INDEX IF NOT EXISTS idx_campus_places_building ON campus_places(building_id);
CREATE INDEX IF NOT EXISTS idx_campus_places_slug ON campus_places(slug);
CREATE INDEX IF NOT EXISTS idx_entrances_building ON entrances(building_id);
CREATE INDEX IF NOT EXISTS idx_campus_paths_campus ON campus_paths(campus_id);
