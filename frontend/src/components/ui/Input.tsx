import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-on-surface">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-on-surface-variant pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-10 bg-surface-container-lowest text-on-surface font-sans text-sm rounded-lg border border-outline placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all shadow-sm',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              error && 'border-error focus:ring-error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-on-surface-variant flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-on-surface-variant">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
