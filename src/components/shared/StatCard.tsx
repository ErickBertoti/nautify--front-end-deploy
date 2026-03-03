import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconBgColor = 'bg-nautify-100',
  iconColor = 'text-nautify-700',
  className,
}: StatCardProps) {
  return (
    <SpotlightCard className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground truncate tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-md',
                  trend.isPositive ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-red-700 bg-red-100 dark:bg-red-500/20 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl shadow-sm transition-transform group-hover:scale-110', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} strokeWidth={2.5} />
        </div>
      </div>
    </SpotlightCard>
  );
}

