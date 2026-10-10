import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  X,
  LayoutDashboard,
  User,
  LogOut,
  ShieldCheck,
  BookOpen,
  Clock,
  CheckSquare,
  FileText,
  CalendarDays,
  Award,
  CalendarRange,
  Compass,
  Building2,
  Sparkles,
  DoorClosed,
  Bell,
  Calendar,
  Users,
  LifeBuoy,
  Package,
  ShieldAlert,
  BellRing,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Badge } from '../ui/Badge.js';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const fullName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : user?.email.split('@')[0];

  const primaryRole = user?.roles[0] || 'STUDENT';
  const isAdmin = user?.roles.includes('ADMIN');
  const generalItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Campus Intelligence (AI)', path: '/ai', icon: Sparkles },
    { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { label: 'Institutional Profile', path: '/profile', icon: User },
    ...(isAdmin ? [{ label: 'AI Safety Admin', path: '/admin/ai', icon: ShieldCheck }] : []),
  ];

  const academicItems = [
    { label: 'Subjects Catalog', path: '/academic/subjects', icon: BookOpen },
    { label: 'Class Schedule', path: '/academic/schedule', icon: Clock },
    { label: 'Attendance', path: '/academic/attendance', icon: CheckSquare },
    { label: 'Assignments', path: '/academic/assignments', icon: FileText },
    { label: 'Exams & Quizzes', path: '/academic/exams', icon: CalendarDays },
    { label: 'Results & Grades', path: '/academic/results', icon: Award },
    { label: 'Academic Calendar', path: '/academic/calendar', icon: CalendarRange },
  ];

  const spatialItems = [
    { label: 'Campus Map & Routes', path: '/campus/map', icon: Compass },
    { label: 'Buildings Directory', path: '/campus/buildings', icon: Building2 },
    { label: 'Facilities & Wi-Fi', path: '/campus/facilities', icon: Sparkles },
    { label: 'Rooms & Labs', path: '/campus/rooms', icon: DoorClosed },
    ...(isAdmin ? [{ label: 'Spatial Admin', path: '/admin/campus', icon: ShieldCheck }] : []),
  ];

  const serviceItems = [
    { label: 'Notices & Circulars', path: '/notices', icon: Bell },
    { label: 'Events & Fests', path: '/events', icon: Calendar },
    { label: 'Clubs & Communities', path: '/clubs', icon: Users },
    { label: 'Helpdesk & Tickets', path: '/services/requests', icon: LifeBuoy },
    { label: 'Services Directory', path: '/services/directory', icon: Compass },
    { label: 'Lost & Found', path: '/lost-found', icon: Package },
    { label: 'Emergency Directory', path: '/emergency', icon: ShieldAlert },
    { label: 'Notifications', path: '/notifications', icon: BellRing },
    ...(isAdmin ? [{ label: 'Services Admin', path: '/admin/services', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface-container-lowest border-r border-outline shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <img
              src="/images/tgpcet-logo.jpg"
              alt="TGPCET College Logo"
              className="h-9 w-auto max-w-[160px] object-contain"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile card */}
          {user && (
            <div className="my-4 p-3 bg-surface-container-low rounded-xl border border-outline/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                {user.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans font-bold text-xs text-on-surface truncate">{fullName}</p>
                <p className="font-mono text-[10px] text-on-surface-variant truncate">{user.email}</p>
                <div className="mt-1">
                  <Badge variant="student" size="sm">
                    {primaryRole}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <div className="text-[10px] font-mono font-bold uppercase text-on-surface-variant px-2 pt-2 pb-1">
            General
          </div>
          <nav className="space-y-1">
            {generalItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="text-[10px] font-mono font-bold uppercase text-on-surface-variant px-2 pt-4 pb-1">
            Academic Core
          </div>
          <nav className="space-y-1">
            {academicItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="text-[10px] font-mono font-bold uppercase text-on-surface-variant px-2 pt-4 pb-1">
            Campus Map & Spatial
          </div>
          <nav className="space-y-1">
            {spatialItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="text-[10px] font-mono font-bold uppercase text-on-surface-variant px-2 pt-4 pb-1">
            Campus Services
          </div>
          <nav className="space-y-1">
            {serviceItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="border-t border-surface-container pt-4">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
