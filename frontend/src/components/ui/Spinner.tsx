import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6" role="status">
      <Loader2 className={cn('animate-spin text-primary-container', sizes[size], className)} />
      {label && <p className="text-sm font-medium text-on-surface-variant">{label}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
