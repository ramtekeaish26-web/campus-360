import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserMenu } from './UserMenu.js';
import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../services/notificationsApi.js';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    notificationsApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.unreadCount || 0))
      .catch(() => {});
  }, [user]);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-4 md:px-8 transition-all">
      <div className="flex items-center gap-3 md:gap-6 flex-1">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo link */}
        <Link to="/dashboard" className="md:hidden flex items-center">
          <img
            src="/images/tgpcet-logo.jpg"
            alt="TGPCET College Logo"
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4">

        {/* Notification Bell Link */}
        <Link
          to="/notifications"
          aria-label="View notifications"
          className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-bold font-mono text-white bg-primary rounded-full flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Menu */}
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
};
