export type NoticeCategory = 'ACADEMIC' | 'EXAM' | 'ADMINISTRATIVE' | 'DEPARTMENT' | 'GENERAL' | 'EMERGENCY';
export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';
export type NoticeAudience = 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface Notice {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  publishedAt: string;
  expiresAt?: string | null;
  status: string;
  audience: NoticeAudience;
  author: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  isRead?: boolean;
  createdAt: string;
}

export type EventCategory = 'ACADEMIC' | 'CULTURAL' | 'SPORTS' | 'TECHNICAL' | 'WORKSHOP' | 'SEMINAR' | 'CLUB' | 'OTHER';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDateTime: string;
  endDateTime: string;
  venue?: string | null;
  location?: {
    id: string;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
  } | null;
  capacity?: number | null;
  registrationRequired: boolean;
  status: string;
  image?: string | null;
  registeredCount: number;
  isRegistered?: boolean;
  registrationId?: string | null;
  organizer: {
    id: string;
    name: string;
  };
}

export type ClubCategory = 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'ACADEMIC' | 'SOCIAL' | 'OTHER';

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ClubCategory;
  logo?: string | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
  memberCount: number;
  isMember?: boolean;
  userRole?: string | null;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
}

export type ServiceRequestCategory =
  | 'ELECTRICAL'
  | 'PROJECTOR'
  | 'WIFI'
  | 'CLEANLINESS'
  | 'WATER'
  | 'FURNITURE'
  | 'INFRASTRUCTURE'
  | 'GENERAL';

export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ServiceRequestStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface ServiceCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: ServiceRequestCategory;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  locationDetails?: string | null;
  buildingId?: string | null;
  roomId?: string | null;
  placeId?: string | null;
  building?: { id: string; name: string } | null;
  room?: { id: string; roomNumber: string; name: string } | null;
  place?: { id: string; name: string; slug: string } | null;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  commentCount?: number;
  comments?: Array<{
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
  }>;
  history?: Array<{
    id: string;
    oldStatus: string | null;
    newStatus: string;
    comment?: string | null;
    createdAt: string;
    changedBy: {
      id: string;
      name: string;
    };
  }>;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LostFoundType = 'LOST' | 'FOUND';
export type LostFoundCategory = 'ID_DOCUMENT' | 'ELECTRONICS' | 'BOOK' | 'CLOTHING' | 'ACCESSORY' | 'OTHER';
export type LostFoundStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED' | 'CLOSED';

export interface LostFoundItem {
  id: string;
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  location?: { id: string; name: string; slug: string } | null;
  locationText?: string | null;
  itemDate: string;
  image?: string | null;
  status: LostFoundStatus;
  claimCount?: number;
  reportedBy?: { id?: string; name: string; email?: string };
  claims?: Array<{
    id: string;
    description: string;
    contactInfo: string;
    status: string;
    createdAt: string;
    claimant: { id: string; name: string };
  }>;
  createdAt: string;
}

export type EmergencyCategory = 'SECURITY' | 'MEDICAL' | 'FIRE' | 'DISASTER' | 'HELPLINE' | 'ADMIN';

export interface EmergencyContact {
  id: string;
  name: string;
  category: EmergencyCategory;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  location?: { id: string; name: string; slug: string; latitude: number; longitude: number } | null;
  locationText?: string | null;
  instructions?: string | null;
  priority: number;
  isDemo: boolean;
  status: string;
}

export interface Feedback {
  id: string;
  targetType: 'SERVICE' | 'EVENT' | 'FACILITY' | 'GENERAL' | 'HELPDESK';
  targetId?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Notification {
  id: string;
  type: 'NOTICE' | 'EVENT' | 'SERVICE_REQUEST' | 'LOST_FOUND' | 'SYSTEM';
  title: string;
  message: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface CampusServiceDirectoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  categoryCode: string;
  building?: { id: string; name: string } | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude: number;
  longitude: number;
  facilities: string[];
}
