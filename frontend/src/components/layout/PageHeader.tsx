import React from 'react';
import { cn } from '../../utils/cn.js';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && <p className="text-sm text-on-surface-variant max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
