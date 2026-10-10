import React from 'react';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-mono font-bold text-on-surface-variant uppercase mb-3">
        HTTP 404 · Not Found
      </div>

      <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-2">
        Page Not Found
      </h1>

      <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
        The requested page does not exist or has been moved in the Campus 360 platform.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
