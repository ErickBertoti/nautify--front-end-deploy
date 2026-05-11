import type { SubscriptionStatus } from '@/types';

export const APP_NAME = 'Nautify';
export const APP_DESCRIPTION = 'Sistema de Gestão de Sociedades Náuticas';

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

export const EXPENSE_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  paga: 'Paga',
  vencida: 'Vencida',
};

export const REVENUE_CATEGORY_LABELS: Record<string, string> = {
  mensalidade: 'Mensalidade',
  aluguel: 'Aluguel',
  evento: 'Evento',
  taxa: 'Taxa',
  outro: 'Outro',
};

export const REVENUE_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  recebida: 'Recebida',
  atrasada: 'Atrasada',
};

export const TRIP_STATUS_LABELS: Record<string, string> = {
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  com_ocorrencia: 'Com ocorrência',
};

export const TRIP_TYPE_LABELS: Record<string, string> = {
  uso: 'Uso',
  teste: 'Teste',
};

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  pago: 'Pago',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  socio: 'Sócio',
  marinheiro: 'Marinheiro',
};

export const BOAT_TYPE_LABELS: Record<string, string> = {
  lancha: 'Lancha',
  jet: 'Jet Ski',
  veleiro: 'Veleiro',
  outro: 'Outro',
};

export const SUBSCRIPTION_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; className: string; cancelable: boolean }
> = {
  trialing: {
    label: 'Trial',
    className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    cancelable: true,
  },
  active: {
    label: 'Ativa',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cancelable: true,
  },
  pending: {
    label: 'Pendente',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    cancelable: true,
  },
  overdue: {
    label: 'Atrasada',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    cancelable: true,
  },
  canceled: {
    label: 'Cancelada',
    className: 'bg-muted text-muted-foreground border-border',
    cancelable: false,
  },
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const MAINTENANCE_PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  reserva: 'Reserva',
  manutencao: 'Manutenção',
  lembrete: 'Lembrete',
  evento: 'Evento',
  outro: 'Outro',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

export const PARTNER_STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  suspenso: 'Suspenso',
};

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  seguro: 'Seguro',
  habilitacao: 'Habilitação',
  contrato: 'Contrato',
  licenca: 'Licença',
  vistoria: 'Vistoria',
  outro: 'Outro',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  valido: 'Válido',
  vencendo: 'Vencendo',
  vencido: 'Vencido',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  manutencao: 'Manutenção',
  financeiro: 'Financeiro',
  documento: 'Documento',
  sistema: 'Sistema',
  agenda: 'Agenda',
};

export const NOTIFICATION_PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};
