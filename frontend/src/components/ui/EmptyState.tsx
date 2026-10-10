import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.js';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-outline rounded-xl bg-surface-container-low/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-display font-semibold text-base text-on-surface mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
