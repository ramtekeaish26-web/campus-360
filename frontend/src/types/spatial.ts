export interface Campus {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  boundary?: any;
  status: string;
}

export type BuildingType =
  | 'ACADEMIC'
  | 'ADMINISTRATIVE'
  | 'LIBRARY'
  | 'HOSTEL'
  | 'SPORTS'
  | 'CANTEEN'
  | 'LAB'
  | 'AUDITORIUM'
  | 'PARKING'
  | 'OTHER';

export type RoomType =
  | 'CLASSROOM'
  | 'LAB'
  | 'OFFICE'
  | 'FACULTY_ROOM'
  | 'SEMINAR_HALL'
  | 'AUDITORIUM'
  | 'UTILITY'
  | 'OTHER';

export interface LocationCategory {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
  displayOrder: number;
}

export interface Facility {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface LocationImage {
  id: string;
  placeId?: string | null;
  buildingId?: string | null;
  url: string;
  altText: string;
  caption?: string | null;
  sortOrder: number;
  status: string;
}

export interface Entrance {
  id: string;
  buildingId: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'MAIN' | 'SIDE' | 'EMERGENCY' | 'SERVICE' | 'ACCESSIBLE';
  accessibilityStatus: boolean;
  status: string;
}

export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  name: string;
  roomType: RoomType;
  description?: string | null;
  capacity?: number | null;
  departmentId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  floor?: Floor;
  places?: CampusPlace[];
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  floorNumber: number;
  displayOrder: number;
  floorPlan?: string | null;
  status: string;
  building?: Building;
  rooms?: Room[];
  _count?: {
    rooms: number;
  };
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  code: string;
  description?: string | null;
  buildingType: BuildingType;
  latitude: number;
  longitude: number;
  geometry?: any;
  status: string;
  floors?: Floor[];
  entrances?: Entrance[];
  places?: CampusPlace[];
  images?: LocationImage[];
  facilities?: {
    facility: Facility;
  }[];
}

export interface CampusPlace {
  id: string;
  campusId: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  buildingId?: string | null;
  roomId?: string | null;
  latitude: number;
  longitude: number;
  geometry?: any;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status: string;
  category: LocationCategory;
  building?: Building | null;
  room?: Room | null;
  facilities?: {
    facility: Facility;
  }[];
  images?: LocationImage[];
}

export interface CampusPath {
  id: string;
  campusId: string;
  name: string;
  geometry: any;
  pathType: 'WALKWAY' | 'ROAD' | 'FOOTPATH' | 'STAIRS' | 'RAMP' | 'CONNECTOR';
  accessible: boolean;
  surface?: string | null;
  lengthMeters: number;
  startNode?: string | null;
  endNode?: string | null;
  status: string;
}

export interface CampusMapBundle {
  campus: Campus | null;
  buildings: Building[];
  places: CampusPlace[];
  categories: LocationCategory[];
  paths: CampusPath[];
}

export interface RouteSegment {
  instruction: string;
  distanceMeters: number;
  estimatedSeconds: number;
  pathType: string;
  accessible: boolean;
  surface?: string;
  startCoordinate: [number, number];
  endCoordinate: [number, number];
}

export interface RouteResult {
  origin: {
    name: string;
    coordinate: { latitude: number; longitude: number };
  };
  destination: {
    name: string;
    coordinate: { latitude: number; longitude: number };
  };
  distanceMeters: number;
  estimatedWalkingMinutes: number;
  accessibleOnly: boolean;
  isAccessible: boolean;
  routeGeometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  segments: RouteSegment[];
}

export interface SpatialSearchResult {
  id: string;
  type: 'PLACE' | 'BUILDING' | 'ROOM' | 'FACILITY';
  name: string;
  code?: string;
  slug?: string;
  category: string;
  description?: string;
  buildingName?: string;
  floorName?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  url: string;
}
