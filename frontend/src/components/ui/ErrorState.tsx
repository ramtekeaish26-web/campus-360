import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.js';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-error/20 rounded-xl bg-error-container/30',
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="font-display font-semibold text-base text-on-surface mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
