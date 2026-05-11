import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'default' | 'sm';
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  size = 'default',
}: EmptyStateProps) {
  const isSm = size === 'sm';

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", isSm ? "py-8 px-2" : "py-16 px-4")}>
      <div className={cn("flex items-center justify-center rounded-2xl bg-muted/50 mb-4", isSm ? "w-12 h-12" : "w-16 h-16")}>
        <Icon className={cn("text-muted-foreground", isSm ? "h-6 w-6" : "h-8 w-8")} />
      </div>
      <h3 className={cn("font-semibold text-foreground mb-1", isSm ? "text-sm" : "text-lg")}>{title}</h3>
      <p className={cn("text-muted-foreground", isSm ? "text-xs max-w-[250px] mb-4" : "text-sm max-w-sm mb-6")}>{description}</p>
      {actionLabel && onAction && (
        <Button size={isSm ? "sm" : undefined} onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
