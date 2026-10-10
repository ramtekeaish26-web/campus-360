import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.roles[0] || 'STUDENT';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-xs font-mono font-bold text-error uppercase mb-3">
        HTTP 403 · Access Denied
      </div>

      <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-2">
        Access Forbidden
      </h1>

      <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
        You do not have permission to perform this action or access this module with your current
        role (<strong className="text-on-surface uppercase font-mono">{role}</strong>).
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            View Your Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};
