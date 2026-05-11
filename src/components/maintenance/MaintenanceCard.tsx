'use client';

import React from 'react';
import {
  Wrench, AlertTriangle, Calendar, Clock, CheckCircle, XCircle,
  Ship, Package, Pencil, Paperclip,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Maintenance } from '@/types';

// Status visual: mantém os 4 valores do DB (agendada / em_andamento / concluida / cancelada),
// porém relabela 'agendada' como 'Pendente' para casar com o vocabulário do produto.
const statusConfig = {
  agendada:     { label: 'Pendente',     color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',       icon: Calendar },
  em_andamento: { label: 'Em andamento', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',   icon: Clock },
  concluida:    { label: 'Concluida',    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', icon: CheckCircle },
  cancelada:    { label: 'Cancelada',    color: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',           icon: XCircle },
} as const;

const priorityConfig = {
  baixa:   { label: 'Baixa',   color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300' },
  media:   { label: 'Media',   color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  alta:    { label: 'Alta',    color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  urgente: { label: 'Urgente', color: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
} as const;

function isOverdue(m: Maintenance): boolean {
  if (m.status !== 'agendada') return false;
  const sched = new Date(m.scheduledDate);
  if (Number.isNaN(sched.getTime())) return false;
  return sched.getTime() < Date.now();
}

interface CostDiffProps {
  estimated: number;
  actual?: number | null;
}

function CostBlock({ estimated, actual }: CostDiffProps) {
  const hasActual = typeof actual === 'number';
  const diff = hasActual ? (actual as number) - estimated : 0;
  const diffClass = diff > 0
    ? 'text-red-600 dark:text-red-300'
    : diff < 0
      ? 'text-emerald-600 dark:text-emerald-300'
      : 'text-muted-foreground';
  const diffSign = diff > 0 ? '+' : '';

  return (
    <>
      <div>
        <p className="text-xs text-muted-foreground">Estimado</p>
        <p className="text-sm font-medium">{formatCurrency(estimated)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Real</p>
        <p className="text-sm font-medium">{hasActual ? formatCurrency(actual as number) : '—'}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Diferenca</p>
        <p className={`text-sm font-medium ${hasActual ? diffClass : 'text-muted-foreground'}`}>
          {hasActual ? `${diffSign}${formatCurrency(diff)}` : '—'}
        </p>
      </div>
    </>
  );
}

interface Props {
  maintenance: Maintenance;
  canWrite: boolean;
  onStart: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onManageParts?: () => void;
  onManageAttachments?: () => void;
}

export function MaintenanceCard({
  maintenance, canWrite, onStart, onComplete, onEdit, onCancel,
  onManageParts, onManageAttachments,
}: Props) {
  const overdue = isOverdue(maintenance);
  const status = statusConfig[maintenance.status] ?? {
    label: maintenance.status,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
    icon: AlertTriangle,
  };
  const priority = priorityConfig[maintenance.priority] ?? {
    label: maintenance.priority,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
  };
  const StatusIcon = status.icon;
  const isPreventiva = maintenance.type === 'preventiva';
  const typeBadgeVariant = isPreventiva ? 'default' : 'outline';
  const typeIconBg = isPreventiva
    ? 'bg-blue-50 dark:bg-blue-500/15'
    : 'bg-amber-50 dark:bg-amber-500/15';
  const typeIconColor = isPreventiva
    ? 'text-blue-600 dark:text-blue-300'
    : 'text-amber-600 dark:text-amber-300';

  const cardBorder = overdue ? 'border-red-300 dark:border-red-500/40 ring-1 ring-red-200/60 dark:ring-red-500/20' : '';

  return (
    <Card className={`hover:shadow-md transition-shadow ${cardBorder}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${typeIconBg}`}>
              <Wrench className={`h-5 w-5 ${typeIconColor}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{maintenance.title}</h3>
              {maintenance.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{maintenance.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              <StatusIcon className="h-3 w-3" /> {status.label}
            </span>
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                <AlertTriangle className="h-3 w-3" /> Atrasada
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">
            <Ship className="h-3 w-3 mr-1" /> {maintenance.boatName || 'Embarcacao'}
          </Badge>
          <Badge variant={typeBadgeVariant}>{isPreventiva ? 'Preventiva' : 'Corretiva'}</Badge>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.color}`}>
            {priority.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-muted/50 rounded-lg text-center">
          <div>
            <p className="text-xs text-muted-foreground">Agendada</p>
            <p className="text-sm font-medium">{formatDate(maintenance.scheduledDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Concluida</p>
            <p className="text-sm font-medium">
              {maintenance.completedDate ? formatDate(maintenance.completedDate) : '—'}
            </p>
          </div>
          <CostBlock estimated={maintenance.estimatedCost} actual={maintenance.actualCost} />
        </div>

        {maintenance.parts && maintenance.parts.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Package className="h-3 w-3" /> Pecas ({maintenance.parts.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {maintenance.parts.map((part) => (
                <span key={part.id} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                  {part.name} (x{part.quantity}) - {formatCurrency(part.unitCost)}
                </span>
              ))}
            </div>
          </div>
        )}

        {maintenance.completionNotes && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium">Conclusao:</span> {maintenance.completionNotes}
          </p>
        )}

        {(onManageParts || onManageAttachments) && (
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            {onManageParts && (
              <button type="button" onClick={onManageParts} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer">
                <Package className="h-3 w-3" /> Peças
              </button>
            )}
            {onManageAttachments && (
              <button type="button" onClick={onManageAttachments} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer">
                <Paperclip className="h-3 w-3" /> Anexos
              </button>
            )}
          </div>
        )}

        {canWrite && (maintenance.status === 'agendada' || maintenance.status === 'em_andamento') && (
          <div className="flex flex-wrap gap-2 mt-4">
            {maintenance.status === 'agendada' && (
              <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={onStart}>
                Iniciar
              </Button>
            )}
            <Button size="sm" className="flex-1 min-w-[100px]" onClick={onComplete}>
              Concluir
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} aria-label="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
