import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    destructive: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    outline: 'border border-border text-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
