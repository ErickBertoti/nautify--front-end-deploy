'use client';

import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCheck,
  AlertTriangle,
  DollarSign,
  Wrench,
  Calendar,
  FileText,
  Ship,
  Info,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/contexts/UserContext';
import { getErrorMessage } from '@/lib/errors';
import { boatInvitationService, notificationService } from '@/services';
import type { Notification, UserRole } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string; bgColor: string }> = {
  financeiro: { label: 'Financeiro', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  documento: { label: 'Documento', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  manutencao: { label: 'Manutenção', icon: Wrench, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  agenda: { label: 'Agenda', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  embarcacao: { label: 'Embarcação', icon: Ship, color: 'text-nautify-700', bgColor: 'bg-nautify-50' },
  sistema: { label: 'Sistema', icon: Info, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  alta: { label: 'Alta', color: 'bg-red-50 text-red-700' },
  media: { label: 'Média', color: 'bg-amber-50 text-amber-700' },
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-600' },
};

const invitationStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-nautify-50 text-nautify-700' },
  accepted: { label: 'Aceito', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Recusado', color: 'bg-gray-100 text-gray-600' },
};

const roleLabel: Record<UserRole, string> = {
  admin: 'Administrador',
  socio: 'Socio',
  marinheiro: 'Marinheiro',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atras`;
  return formatDate(dateStr);
}

function isPendingInvitation(notification: Notification): boolean {
  return notification.relatedEntityType === 'boat_invitation' && notification.invitation?.status === 'pending';
}

export default function NotificacoesPage() {
  const [typeFilter, setTypeFilter] = useState('todos');
  const [readFilter, setReadFilter] = useState('todos');
  const [actionState, setActionState] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const toast = useToast();
  const { refetch: refetchUser } = useUser();

  const { data: notifications, loading, error, refetch } = useApi<Notification[]>(
    () => notificationService.list(),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !notifications) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar notificacoes'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;
  const highPriority = notifications.filter((n) => n.priority === 'alta' && !n.isRead).length;
  const markableUnread = notifications.filter((n) => !n.isRead && !isPendingInvitation(n)).length;

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'todos' && n.type !== typeFilter) return false;
    if (readFilter === 'nao-lidas' && n.isRead) return false;
    if (readFilter === 'lidas' && !n.isRead) return false;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar notificacao como lida.'));
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar notificacoes como lidas.'));
    }
  };

  const handleInvitationAction = async (notification: Notification, action: 'accept' | 'reject') => {
    const invitationId = notification.invitation?.id;
    if (!invitationId) return;

    setActionState({ id: invitationId, action });
    try {
      if (action === 'accept') {
        await boatInvitationService.accept(invitationId);
        toast.success('Convite aceito com sucesso.');
      } else {
        await boatInvitationService.reject(invitationId);
        toast.success('Convite recusado.');
      }

      await Promise.all([refetch(), refetchUser()]);
    } catch (err) {
      toast.error(getErrorMessage(err, `Erro ao ${action === 'accept' ? 'aceitar' : 'recusar'} convite.`));
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Central de avisos e alertas</p>
        </div>
        {markableUnread > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Não Lidas" value={String(unread)} subtitle="notificações" icon={Bell} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Prioridade Alta" value={String(highPriority)} subtitle="pendentes" icon={AlertTriangle} iconBgColor="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Total" value={String(notifications.length)} subtitle="notificações" icon={BellOff} iconBgColor="bg-gray-100" iconColor="text-gray-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="todos">Todos os tipos</option>
          <option value="financeiro">Financeiro</option>
          <option value="documento">Documento</option>
          <option value="manutencao">Manutenção</option>
          <option value="agenda">Agenda</option>
          <option value="embarcacao">Embarcação</option>
          <option value="sistema">Sistema</option>
        </Select>
        <Select value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
          <option value="todos">Todas</option>
          <option value="nao-lidas">Não lidas</option>
          <option value="lidas">Lidas</option>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((notification) => {
          const typeInfo = typeConfig[notification.type] || typeConfig.sistema;
          const TypeIcon = typeInfo.icon;
          const priority = priorityConfig[notification.priority];
          const invitation = notification.invitation;
          const pendingInvitation = isPendingInvitation(notification);
          const invitationStatus = invitation ? invitationStatusConfig[invitation.status] : null;
          const isAccepting = actionState?.id === invitation?.id && actionState?.action === 'accept';
          const isRejecting = actionState?.id === invitation?.id && actionState?.action === 'reject';

          return (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-sm ${!notification.isRead ? 'border-l-4 border-l-nautify-500 bg-nautify-50/20' : ''}`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.bgColor}`}>
                    <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && <span className="w-2 h-2 rounded-full bg-nautify-500 shrink-0" />}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>

                    {invitation && (
                      <div className="mt-3 rounded-lg border border-border/60 bg-background/80 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{invitation.boatName}</p>
                            <p className="text-xs text-muted-foreground">
                              Convidado por {invitation.inviterName} como {roleLabel[invitation.role]}.
                            </p>
                          </div>
                          {invitationStatus && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${invitationStatus.color}`}>
                              {invitationStatus.label}
                            </span>
                          )}
                        </div>

                        {pendingInvitation && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Button
                              size="sm"
                              onClick={() => handleInvitationAction(notification, 'accept')}
                              isLoading={isAccepting}
                              disabled={Boolean(actionState)}
                            >
                              {isAccepting ? 'Aceitando...' : 'Aceitar convite'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationAction(notification, 'reject')}
                              isLoading={isRejecting}
                              disabled={Boolean(actionState)}
                            >
                              {isRejecting ? 'Recusando...' : 'Recusar'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(notification.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && !pendingInvitation && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} title="Marcar como lida">
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={BellOff}
          title="Nenhuma notificacao"
          description="Voce esta em dia com tudo!"
        />
      )}
    </div>
  );
}
