import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge.js';

interface UserMenuProps {
  user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : user.email.split('@')[0];

  const primaryRole = user.roles[0] || 'STUDENT';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'admin';
      case 'FACULTY':
        return 'faculty';
      default:
        return 'student';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-container-high transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary-container"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm shrink-0 border border-outline">
          {user.profile?.avatarUrl ? (
            <img
              src={user.profile.avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{fullName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-sans font-semibold text-xs text-on-surface leading-tight truncate max-w-[130px]">
            {fullName}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">
            {primaryRole}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-outline py-2 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-4 py-2.5 border-b border-surface-container">
            <p className="font-display font-bold text-sm text-on-surface truncate">{fullName}</p>
            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <Badge variant={getRoleBadgeVariant(primaryRole)} size="sm">
                {primaryRole}
              </Badge>
              {user.profile?.prn && (
                <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                  PRN: {user.profile.prn}
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <UserIcon className="w-4 h-4 text-on-surface-variant" />
              <span>Institutional Profile</span>
            </Link>
            {primaryRole === 'ADMIN' && (
              <div className="px-4 py-1.5 flex items-center gap-2 text-[11px] font-semibold text-tertiary">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Privileges Active</span>
              </div>
            )}
          </div>

          <div className="border-t border-surface-container pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-error hover:bg-error-container/30 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
