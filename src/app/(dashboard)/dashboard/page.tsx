'use client';

import React from 'react';
import Link from 'next/link';
import {
  Ship,
  Receipt,
  Navigation,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Users,
  Wrench,
  FileText,
  Bell,
  CalendarDays,
  ArrowDownUp,
  Plus,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data expandido
const mockStats = {
  totalBoats: 2,
  totalExpensesMonth: 8450.0,
  totalRevenueMonth: 12600.0,
  totalTripsMonth: 7,
  pendingMaintenances: 2,
  expiringDocuments: 1,
  unreadNotifications: 3,
  cashFlowBalance: 4150.0,
};

const mockRecentExpenses = [
  { id: '1', description: 'Marina Mensalidade - Mar/2026', amount: 3200, category: 'fixa', status: 'pendente', dueDate: '2026-03-05' },
  { id: '2', description: 'Manutenção Motor', amount: 1850, category: 'variavel', status: 'paga', dueDate: '2026-02-15' },
  { id: '3', description: 'Seguro Anual', amount: 4500, category: 'fixa', status: 'pendente', dueDate: '2026-03-01' },
];

const mockUpcomingEvents = [
  { id: '1', title: 'Manutenção Preventiva - Mar Azul', type: 'manutencao', date: '2026-03-08', color: 'bg-amber-500' },
  { id: '2', title: 'Reserva - Veleiro Sol', type: 'reserva', date: '2026-03-10', color: 'bg-nautify-500' },
  { id: '3', title: 'Vencimento Seguro', type: 'lembrete', date: '2026-03-15', color: 'bg-red-500' },
  { id: '4', title: 'Saída programada - Mar Azul', type: 'reserva', date: '2026-03-18', color: 'bg-emerald-500' },
];

const mockNotifications = [
  { id: '1', title: 'Manutenção agendada', message: 'Revisão do motor da Mar Azul em 5 dias', type: 'manutencao', priority: 'alta', createdAt: '2026-03-01' },
  { id: '2', title: 'Documento vencendo', message: 'Seguro da Veleiro Sol vence em 15 dias', type: 'documento', priority: 'media', createdAt: '2026-03-01' },
  { id: '3', title: 'Pagamento pendente', message: 'Mensalidade da marina vence em 5 dias', type: 'financeiro', priority: 'alta', createdAt: '2026-03-01' },
];

const mockMonthlyChart = [
  { month: 'Out', revenue: 10200, expense: 7800 },
  { month: 'Nov', revenue: 11500, expense: 9200 },
  { month: 'Dez', revenue: 13000, expense: 10500 },
  { month: 'Jan', revenue: 11800, expense: 8900 },
  { month: 'Fev', revenue: 12600, expense: 8450 },
];

const categoryColors: Record<string, string> = {
  fixa: 'bg-blue-50 text-blue-700',
  variavel: 'bg-purple-50 text-purple-700',
  individual: 'bg-amber-50 text-amber-700',
};

const categoryLabels: Record<string, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-700',
  paga: 'bg-emerald-50 text-emerald-700',
  vencida: 'bg-red-50 text-red-700',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  paga: 'Paga',
  vencida: 'Vencida',
};

const notifTypeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  manutencao: { icon: Wrench, color: 'text-amber-600 bg-amber-50' },
  documento: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  financeiro: { icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
  sistema: { icon: Bell, color: 'text-gray-600 bg-gray-50' },
  agenda: { icon: CalendarDays, color: 'text-nautify-600 bg-nautify-50' },
};

export default function DashboardPage() {
  const maxChartValue = Math.max(...mockMonthlyChart.flatMap((m) => [m.revenue, m.expense]));

  return (
    <div className="space-y-6">
      {/* Welcome + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Olá, Gabriel!</h1>
          <p className="text-muted-foreground">
            Resumo das suas embarcações — Março de 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financeiro/despesas">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova Despesa
            </Button>
          </Link>
          <Link href="/agenda">
            <Button size="sm">
              <CalendarDays className="h-4 w-4 mr-1" /> Agendar
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(mockStats.totalRevenueMonth)}
          subtitle="total recebido"
          icon={TrendingUp}
          trend={{ value: 9, isPositive: true }}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(mockStats.totalExpensesMonth)}
          subtitle="total acumulado"
          icon={TrendingDown}
          trend={{ value: 12, isPositive: false }}
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(mockStats.cashFlowBalance)}
          subtitle="receitas - despesas"
          icon={ArrowDownUp}
          iconBgColor="bg-nautify-50"
          iconColor="text-nautify-700"
        />
        <StatCard
          title="Embarcações"
          value={String(mockStats.totalBoats)}
          subtitle="ativas no momento"
          icon={Ship}
          iconBgColor="bg-nautify-100"
          iconColor="text-nautify-700"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/saidas" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.totalTripsMonth}</p>
                <p className="text-xs text-muted-foreground">Saídas no Mês</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/manutencao" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Wrench className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.pendingMaintenances}</p>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/documentos" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.expiringDocuments}</p>
                <p className="text-xs text-muted-foreground">Docs Vencendo</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/notificacoes" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.unreadNotifications}</p>
                <p className="text-xs text-muted-foreground">Notificações</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita vs Despesa Chart */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
              Receitas vs Despesas
            </CardTitle>
            <Link href="/financeiro/fluxo-caixa">
              <Button variant="ghost" size="sm">
                Ver detalhes <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 sm:gap-4 h-48">
              {mockMonthlyChart.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex gap-0.5 sm:gap-1 items-end w-full justify-center h-40">
                    <div
                      className="w-3 sm:w-5 bg-emerald-400 rounded-t transition-all"
                      style={{ height: `${(month.revenue / maxChartValue) * 100}%` }}
                      title={`Receitas: ${formatCurrency(month.revenue)}`}
                    />
                    <div
                      className="w-3 sm:w-5 bg-red-400 rounded-t transition-all"
                      style={{ height: `${(month.expense / maxChartValue) * 100}%` }}
                      title={`Despesas: ${formatCurrency(month.expense)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-muted-foreground">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Despesas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rateio do Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Rateio Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Sua parte este mês</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(2816.67)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total de {formatCurrency(8450)} ÷ 3 sócios
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Fixas', color: 'bg-blue-500', value: 5200, pct: 61 },
                { label: 'Variáveis', color: 'bg-purple-500', value: 2450, pct: 29 },
                { label: 'Individuais', color: 'bg-amber-500', value: 800, pct: 10 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid - Expenses + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Despesas Recentes
            </CardTitle>
            <Link href="/financeiro/despesas">
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {mockRecentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[expense.category]}`}>
                          {categoryLabels[expense.category]}
                        </span>
                        {expense.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Venc. {formatDate(expense.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[expense.status]}`}>
                      {statusLabels[expense.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              Próximos Eventos
            </CardTitle>
            <Link href="/agenda">
              <Button variant="ghost" size="sm">
                Ver agenda <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {mockUpcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 px-6 py-3.5">
                  <div className={`w-1 h-10 rounded-full ${event.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{event.type === 'manutencao' ? 'Manutenção' : event.type === 'reserva' ? 'Reserva' : 'Lembrete'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Alertas e Notificações
          </CardTitle>
          <Link href="/notificacoes">
            <Button variant="ghost" size="sm">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mockNotifications.map((notif) => {
              const typeConfig = notifTypeIcons[notif.type] || notifTypeIcons.sistema;
              const Icon = typeConfig.icon;
              return (
                <div key={notif.id} className="flex items-start gap-3 px-6 py-3.5">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${typeConfig.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      {notif.priority === 'alta' && <Badge variant="destructive">Urgente</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(notif.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
