import React from 'react';
import { cn } from '../../utils/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'student'
    | 'faculty'
    | 'admin'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline'
    | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider select-none';

  const variants = {
    default: 'bg-surface-container text-on-primary-fixed-variant',
    student: 'bg-surface-container text-on-primary-fixed-variant border border-surface-variant',
    faculty: 'bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary-fixed-dim',
    admin: 'bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim',
    primary: 'bg-primary-container text-on-primary border border-primary/20',
    secondary: 'bg-secondary-fixed/40 text-secondary border border-secondary/30',
    tertiary: 'bg-tertiary-fixed/40 text-tertiary border border-tertiary/30',
    success: 'bg-[#ECFDF5] text-tertiary border border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    error: 'bg-error-container text-on-error-container border border-[#FECACA]',
    outline: 'border border-outline text-on-surface-variant',
    neutral: 'bg-surface-container-high text-on-surface-variant',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] leading-tight',
    md: 'px-2.5 py-0.5 text-[11px] leading-normal',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
