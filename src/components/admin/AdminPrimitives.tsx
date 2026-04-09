'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { LucideIcon } from 'lucide-react';

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  accent = 'amber',
  helper,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'amber' | 'cyan' | 'emerald' | 'rose';
  helper?: string;
}) {
  const accents = {
    amber: 'from-amber-400/16 to-transparent text-amber-200',
    cyan: 'from-cyan-400/16 to-transparent text-cyan-200',
    emerald: 'from-emerald-400/16 to-transparent text-emerald-200',
    rose: 'from-rose-400/16 to-transparent text-rose-200',
  };

  return (
    <Card className="border-white/8 bg-white/4 before:hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px] sm:tracking-[0.22em]">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
            {helper && <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">{helper}</p>}
          </div>
          <div className={cn('shrink-0 rounded-2xl bg-gradient-to-br p-2.5 sm:p-3', accents[accent])}>
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {actions && <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">{actions}</div>}
    </div>
  );
}

export function AccountStatusBadge({ status }: { status: 'active' | 'suspended' }) {
  return <Badge variant={status === 'active' ? 'success' : 'destructive'}>{status === 'active' ? 'Ativa' : 'Suspensa'}</Badge>;
}

export function AdminRoleBadge({ isPlatformAdmin }: { isPlatformAdmin: boolean }) {
  return <Badge variant={isPlatformAdmin ? 'warning' : 'outline'}>{isPlatformAdmin ? 'Global Admin' : 'Cliente'}</Badge>;
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' }> = {
    active: { label: 'Ativa', variant: 'success' },
    pending: { label: 'Pendente', variant: 'warning' },
    trialing: { label: 'Trial', variant: 'secondary' },
    overdue: { label: 'Atrasada', variant: 'destructive' },
    canceled: { label: 'Cancelada', variant: 'outline' },
  };
  const meta = map[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function PromotionModeLabel({ mode, value }: { mode: string; value: number }) {
  if (mode === 'fixed_price') return <span>{formatCurrency(value)} fixo</span>;
  if (mode === 'amount_off') return <span>{formatCurrency(value)} off</span>;
  if (mode === 'percent_off') return <span>{value}% off</span>;
  return <span>{mode}</span>;
}
