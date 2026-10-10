import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { MobileNav } from './MobileNav.js';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area offset by Sidebar on desktop */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-150">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
