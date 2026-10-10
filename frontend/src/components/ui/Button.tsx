import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-primary-container text-on-primary hover:bg-[#1E3A5F] focus:ring-primary-container shadow-sm',
    secondary:
      'bg-surface-container-high text-on-surface hover:bg-surface-dim focus:ring-surface-container-high',
    accent:
      'bg-secondary text-on-secondary hover:bg-[#C84614] focus:ring-secondary shadow-sm',
    outline:
      'border border-outline bg-surface-container-lowest text-on-surface hover:bg-surface-container-low hover:border-slate-400 focus:ring-primary-container',
    ghost:
      'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus:ring-primary-container',
    danger:
      'bg-error text-on-error hover:bg-red-700 focus:ring-error shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
