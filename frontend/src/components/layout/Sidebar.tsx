import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Building2,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  Award,
  CalendarRange,
  Clock,
  Compass,
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

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ADMIN');
  const isFaculty = user?.roles.includes('FACULTY');

  const mainNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Institutional Profile',
      path: '/profile',
      icon: User,
    },
  ];

  const academicNavItems = [
    {
      label: 'Subjects & Catalog',
      path: '/academic/subjects',
      icon: BookOpen,
    },
    {
      label: 'Class Schedule',
      path: '/academic/schedule',
      icon: Clock,
    },
    {
      label: 'Attendance',
      path: '/academic/attendance',
      icon: CheckSquare,
    },
    {
      label: 'Assignments',
      path: '/academic/assignments',
      icon: FileText,
    },
    {
      label: 'Exams & Quizzes',
      path: '/academic/exams',
      icon: CalendarDays,
    },
    {
      label: 'Results & Grades',
      path: '/academic/results',
      icon: Award,
    },
    {
      label: 'Academic Calendar',
      path: '/academic/calendar',
      icon: CalendarRange,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 select-none overflow-y-auto">
      <div className="flex flex-col">
        {/* Institutional Branding Header */}
        <div className="h-16 px-5 flex items-center border-b border-surface-container shrink-0">
          <img
            src="/images/tgpcet-logo.jpg"
            alt="TGPCET College Logo"
            className="h-10 w-auto max-w-[190px] object-contain"
          />
        </div>

        {/* General Navigation */}
        <div className="px-4 pt-3 pb-1">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2">
            Overview
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Phase 5 Campus Intelligence Link */}
          <NavLink
            to="/ai"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-sm border-l-4 border-secondary font-bold'
                  : 'text-secondary hover:bg-secondary/10 hover:text-secondary-dark'
              )
            }
          >
            <Sparkles className="w-4 h-4 shrink-0 text-secondary" />
            <span className="flex items-center justify-between flex-1">
              <span>Campus Intelligence</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-secondary/20 rounded">AI</span>
            </span>
          </NavLink>

          {/* Phase 6 Smart Analytics Link */}
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-primary" />
            <span>Analytics & Reports</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/ai"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                )
              }
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>AI Audit Console</span>
            </NavLink>
          )}
        </nav>

        {/* Phase 2 Academic Core Modules */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2">
            Academic Core
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {academicNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Phase 3 Campus Spatial Core & Map */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2">
            Campus Map & Spatial
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          <NavLink
            to="/campus/map"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Map & Wayfinding</span>
          </NavLink>

          <NavLink
            to="/campus/buildings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Buildings Directory</span>
          </NavLink>

          <NavLink
            to="/campus/facilities"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Facilities & Amenities</span>
          </NavLink>

          <NavLink
            to="/campus/rooms"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <DoorClosed className="w-4 h-4 shrink-0" />
            <span>Rooms & Labs</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/campus"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                )
              }
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Spatial Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Phase 4 Campus Services & Engagement */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2">
            Campus Services
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          <NavLink
            to="/notices"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notices & Circulars</span>
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Events & Fests</span>
          </NavLink>

          <NavLink
            to="/clubs"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Clubs & Communities</span>
          </NavLink>

          <NavLink
            to="/services/requests"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <LifeBuoy className="w-4 h-4 shrink-0" />
            <span>Helpdesk & Tickets</span>
          </NavLink>

          <NavLink
            to="/services/directory"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Services Directory</span>
          </NavLink>

          <NavLink
            to="/lost-found"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Lost & Found</span>
          </NavLink>

          <NavLink
            to="/emergency"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-rose-500/20 text-rose-400 shadow-sm border-l-4 border-rose-500'
                  : 'text-rose-400/80 hover:bg-rose-950/20 hover:text-rose-300'
              )
            }
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Emergency Directory</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )
            }
          >
            <BellRing className="w-4 h-4 shrink-0" />
            <span>Notifications</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/services"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm border-l-4 border-secondary'
                    : 'text-amber-500 hover:bg-amber-950/30'
                )
              }
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Services Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Role Workspace Callout */}
        <div className="mt-6 px-4 py-2">
          <span className="font-mono text-[10px] text-on-surface-variant font-bold uppercase tracking-wider px-2">
            Active Workspace
          </span>
          <div className="mt-2 p-3 bg-surface-container-low rounded-xl border border-outline/50 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              {isAdmin && <ShieldCheck className="w-4 h-4 text-secondary" />}
              {isFaculty && <GraduationCap className="w-4 h-4 text-primary" />}
              {!isAdmin && !isFaculty && <Building2 className="w-4 h-4 text-tertiary" />}
              <span>
                {isAdmin ? 'Admin Workspace' : isFaculty ? 'Faculty Portal' : 'Student Cockpit'}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              {isAdmin
                ? 'Full system oversight & authorization active.'
                : isFaculty
                ? 'Department & academic responsibilities active.'
                : 'Enrolled coursework & profile overview.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Strip */}
      <div className="p-3 bg-surface-container-low border-t border-surface-container">
        <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline/60 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-sans text-xs font-semibold text-on-surface">Nagpur Gateway</span>
          </div>
          <span className="font-mono text-xs font-bold text-tertiary">99.98%</span>
        </div>
      </div>
    </aside>
  );
};
