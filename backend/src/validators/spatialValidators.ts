import { z } from 'zod';

export const buildingTypeEnum = z.enum([
  'ACADEMIC',
  'ADMINISTRATIVE',
  'LIBRARY',
  'HOSTEL',
  'SPORTS',
  'CANTEEN',
  'LAB',
  'AUDITORIUM',
  'PARKING',
  'OTHER',
]);

export const roomTypeEnum = z.enum([
  'CLASSROOM',
  'LAB',
  'OFFICE',
  'FACULTY_ROOM',
  'SEMINAR_HALL',
  'AUDITORIUM',
  'UTILITY',
  'OTHER',
]);

export const pathTypeEnum = z.enum([
  'WALKWAY',
  'ROAD',
  'FOOTPATH',
  'STAIRS',
  'RAMP',
  'CONNECTOR',
]);

export const entranceTypeEnum = z.enum([
  'MAIN',
  'SIDE',
  'EMERGENCY',
  'SERVICE',
  'ACCESSIBLE',
]);

// Building schemas
export const buildingCreateSchema = z.object({
  campusId: z.string().uuid('Invalid campus ID'),
  name: z.string().min(2, 'Building name is required'),
  code: z.string().min(2, 'Building code is required'),
  description: z.string().optional().nullable(),
  buildingType: buildingTypeEnum.default('ACADEMIC'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geometry: z.any().optional().nullable(),
  facilityIds: z.array(z.string().uuid()).optional(),
});

export const buildingUpdateSchema = buildingCreateSchema.partial();

// Floor schemas
export const floorCreateSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  name: z.string().min(1, 'Floor name is required'),
  floorNumber: z.number().int(),
  displayOrder: z.number().int().optional().default(0),
  floorPlan: z.string().optional().nullable(),
});

export const floorUpdateSchema = floorCreateSchema.partial();

// Room schemas
export const roomCreateSchema = z.object({
  floorId: z.string().uuid('Invalid floor ID'),
  roomNumber: z.string().min(1, 'Room number is required'),
  name: z.string().min(2, 'Room name is required'),
  roomType: roomTypeEnum.default('CLASSROOM'),
  description: z.string().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

// Campus Place schemas
export const placeCreateSchema = z.object({
  campusId: z.string().uuid('Invalid campus ID'),
  name: z.string().min(2, 'Place name is required'),
  slug: z.string().min(2, 'Valid slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  buildingId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  geometry: z.any().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  facilityIds: z.array(z.string().uuid()).optional(),
});

export const placeUpdateSchema = placeCreateSchema.partial();

// Facility schema
export const facilityCreateSchema = z.object({
  code: z.string().min(2, 'Facility code is required'),
  name: z.string().min(2, 'Facility name is required'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

// Entrance schema
export const entranceCreateSchema = z.object({
  buildingId: z.string().uuid('Invalid building ID'),
  name: z.string().min(2, 'Entrance name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: entranceTypeEnum.default('MAIN'),
  accessibilityStatus: z.boolean().default(true),
});

// Campus Path schema
export const pathCreateSchema = z.object({
  campusId: z.string().uuid('Invalid campus ID'),
  name: z.string().min(2, 'Path name is required'),
  geometry: z.any({ required_error: 'Path geometry coordinates are required' }),
  pathType: pathTypeEnum.default('WALKWAY'),
  accessible: z.boolean().default(true),
  surface: z.string().optional().nullable(),
  lengthMeters: z.number().nonnegative().optional().default(0),
  startNode: z.string().optional().nullable(),
  endNode: z.string().optional().nullable(),
});

export const pathUpdateSchema = pathCreateSchema.partial();

// Location Image schema
export const imageCreateSchema = z.object({
  placeId: z.string().uuid().optional().nullable(),
  buildingId: z.string().uuid().optional().nullable(),
  url: z.string().url('Valid image URL is required'),
  altText: z.string().min(2, 'Alt text is required'),
  caption: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

// Route Calculation Schema
export const coordinatePointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const routeRequestSchema = z.object({
  origin: z.union([
    coordinatePointSchema,
    z.object({ placeId: z.string().uuid() }),
    z.object({ buildingId: z.string().uuid() }),
    z.object({ roomId: z.string().uuid() }),
  ]),
  destination: z.union([
    coordinatePointSchema,
    z.object({ placeId: z.string().uuid() }),
    z.object({ buildingId: z.string().uuid() }),
    z.object({ roomId: z.string().uuid() }),
  ]),
  accessibleOnly: z.boolean().optional().default(false),
});

// Search Query Schema
export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  category: z.string().optional(),
  buildingId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional().default(20),
});
