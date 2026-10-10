import React from 'react';
import { cn } from '../../utils/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'accent' | 'ribbon';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-surface-container-lowest border border-outline rounded-xl shadow-sm',
    elevated: 'bg-surface-container-lowest border border-outline rounded-xl shadow-md hover:shadow-lg transition-shadow',
    bordered: 'bg-surface-container-lowest border border-outline rounded-xl',
    accent: 'bg-surface-container-low border border-surface-container-high rounded-xl',
    ribbon: 'bg-primary-container text-on-primary rounded-xl shadow-md relative overflow-hidden',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn('px-5 py-4 border-b border-surface-container flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('font-display font-semibold text-base text-on-surface', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);
