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
  Trash2,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/shared/StatCard';
import { formatDate } from '@/lib/utils';

const mockNotifications = [
  {
    id: '1', type: 'financeiro', title: 'Contribuição pendente',
    message: 'A contribuição de Pedro Oliveira referente a Março/2026 está pendente.',
    priority: 'media', read: false, createdAt: '2026-03-18T14:30:00',
  },
  {
    id: '2', type: 'documento', title: 'Documento vencendo',
    message: 'A Habilitação Náutica de Gabriel Santos vence em 15/04/2026.',
    priority: 'alta', read: false, createdAt: '2026-03-18T10:00:00',
  },
  {
    id: '3', type: 'manutencao', title: 'Manutenção agendada',
    message: 'Revisão do motor da embarcação Mar Azul agendada para 25/03/2026.',
    priority: 'media', read: false, createdAt: '2026-03-17T09:00:00',
  },
  {
    id: '4', type: 'financeiro', title: 'Contribuição atrasada',
    message: 'Lucas Ferreira possui 2 contribuições em atraso totalizando R$ 5.250,00.',
    priority: 'alta', read: false, createdAt: '2026-03-16T08:00:00',
  },
  {
    id: '5', type: 'agenda', title: 'Reserva confirmada',
    message: 'Sua reserva da embarcação Mar Azul para 22/03/2026 foi confirmada.',
    priority: 'baixa', read: true, createdAt: '2026-03-15T16:00:00',
  },
  {
    id: '6', type: 'documento', title: 'TIEM vencido',
    message: 'O TIEM da embarcação Mar Azul está vencido desde 10/01/2026. Renove imediatamente.',
    priority: 'alta', read: true, createdAt: '2026-03-14T08:00:00',
  },
  {
    id: '7', type: 'embarcacao', title: 'Nova embarcação adicionada',
    message: 'A embarcação Veleiro Sol foi adicionada ao sistema com sucesso.',
    priority: 'baixa', read: true, createdAt: '2026-03-10T11:30:00',
  },
  {
    id: '8', type: 'sistema', title: 'Bem-vindo ao Nautify',
    message: 'Sua conta foi criada com sucesso. Explore os recursos do sistema.',
    priority: 'baixa', read: true, createdAt: '2026-03-01T08:00:00',
  },
];

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

function timeAgo(dateStr: string): string {
  const now = new Date('2026-03-18T18:00:00');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDate(dateStr);
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [readFilter, setReadFilter] = useState('todos');

  const unread = notifications.filter((n) => !n.read).length;
  const highPriority = notifications.filter((n) => n.priority === 'alta' && !n.read).length;

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'todos' && n.type !== typeFilter) return false;
    if (readFilter === 'nao-lidas' && n.read) return false;
    if (readFilter === 'lidas' && !n.read) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Central de avisos e alertas</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Não Lidas" value={String(unread)} subtitle="notificações" icon={Bell} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Prioridade Alta" value={String(highPriority)} subtitle="pendentes" icon={AlertTriangle} iconBgColor="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Total" value={String(notifications.length)} subtitle="notificações" icon={BellOff} iconBgColor="bg-gray-100" iconColor="text-gray-600" />
      </div>

      {/* Filters */}
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

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map((notification) => {
          const typeInfo = typeConfig[notification.type] || typeConfig.sistema;
          const TypeIcon = typeInfo.icon;
          const priority = priorityConfig[notification.priority];

          return (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-sm ${!notification.read ? 'border-l-4 border-l-nautify-500 bg-nautify-50/20' : ''}`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.bgColor}`}>
                    <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <span className="w-2 h-2 rounded-full bg-nautify-500 shrink-0" />}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(notification.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} title="Marcar como lida">
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeNotification(notification.id)} title="Remover">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma notificação</p>
          <p className="text-sm">Você está em dia com tudo!</p>
        </div>
      )}
    </div>
  );
}
