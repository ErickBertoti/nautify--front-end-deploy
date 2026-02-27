import React from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  EXPENSE_STATUS_LABELS,
  TRIP_STATUS_LABELS,
  INCIDENT_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
  USER_ROLE_LABELS,
} from '@/constants';

type StatusType = 'expense' | 'trip' | 'incident' | 'category' | 'role';

interface StatusBadgeProps {
  type: StatusType;
  value: string;
}

const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
  // Expense status
  pendente: 'warning',
  paga: 'success',
  vencida: 'destructive',
  // Trip status
  em_andamento: 'default',
  finalizada: 'success',
  com_ocorrencia: 'destructive',
  // Incident status
  aprovado: 'default',
  // pago: already 'success' via 'paga'
  // Categories
  fixa: 'secondary',
  variavel: 'outline',
  individual: 'warning',
  // Roles
  admin: 'default',
  socio: 'secondary',
  marinheiro: 'outline',
};

const labelsMap: Record<StatusType, Record<string, string>> = {
  expense: EXPENSE_STATUS_LABELS,
  trip: TRIP_STATUS_LABELS,
  incident: INCIDENT_STATUS_LABELS,
  category: EXPENSE_CATEGORY_LABELS,
  role: USER_ROLE_LABELS,
};

export function StatusBadge({ type, value }: StatusBadgeProps) {
  const label = labelsMap[type]?.[value] || value;
  const variant = statusVariantMap[value] || 'secondary';

  return <Badge variant={variant}>{label}</Badge>;
}
