import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { StudentDashboardView } from './StudentDashboardView.js';
import { FacultyDashboardView } from './FacultyDashboardView.js';
import { AdminDashboardView } from './AdminDashboardView.js';
import { Spinner } from '../../components/ui/Spinner.js';

export const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Spinner size="lg" label="Loading role dashboard..." />
      </div>
    );
  }

  if (user.roles.includes('ADMIN')) {
    return <AdminDashboardView user={user} />;
  }

  if (user.roles.includes('FACULTY')) {
    return <FacultyDashboardView user={user} />;
  }

  return <StudentDashboardView user={user} />;
};
