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
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
            {helper && <p className="mt-2 text-sm text-slate-400">{helper}</p>}
          </div>
          <div className={cn('rounded-2xl bg-gradient-to-br p-3', accents[accent])}>
            <Icon className="h-5 w-5" />
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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
