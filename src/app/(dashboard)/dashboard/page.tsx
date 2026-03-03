'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

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
  fixa: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  variavel: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  individual: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
};

const categoryLabels: Record<string, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  paga: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  vencida: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  paga: 'Paga',
  vencida: 'Vencida',
};

const notifTypeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  manutencao: { icon: Wrench, color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400' },
  documento: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400' },
  financeiro: { icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' },
  sistema: { icon: Bell, color: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-500/20 dark:text-zinc-400' },
  agenda: { icon: CalendarDays, color: 'text-nautify-600 bg-nautify-100 dark:bg-nautify-500/20 dark:text-nautify-400' },
};

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Welcome + Quick Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl text-foreground !font-heading tracking-tight">Olá, Gabriel!</h1>
          <p className="text-muted-foreground mt-1">
            Resumo das suas embarcações — Março de 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financeiro/despesas">
            <Button variant="outline" size="sm" className="shadow-sm border-nautify-200 hover:bg-nautify-50 dark:border-nautify-800 dark:hover:bg-nautify-900/50">
              <Plus className="h-4 w-4 mr-1" /> Nova Despesa
            </Button>
          </Link>
          <Link href="/agenda">
            <Button size="sm" className="shadow-md bg-nautify-600 hover:bg-nautify-700 text-white">
              <CalendarDays className="h-4 w-4 mr-1" /> Agendar
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(mockStats.totalRevenueMonth)}
          subtitle="total recebido"
          icon={TrendingUp}
          trend={{ value: 9, isPositive: true }}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(mockStats.totalExpensesMonth)}
          subtitle="total acumulado"
          icon={TrendingDown}
          trend={{ value: 12, isPositive: false }}
          iconBgColor="bg-red-100 dark:bg-red-500/20"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(mockStats.cashFlowBalance)}
          subtitle="receitas - despesas"
          icon={ArrowDownUp}
          iconBgColor="bg-blue-100 dark:bg-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Embarcações"
          value={String(mockStats.totalBoats)}
          subtitle="ativas no momento"
          icon={Ship}
          iconBgColor="bg-nautify-100 dark:bg-nautify-500/20"
          iconColor="text-nautify-700 dark:text-nautify-400"
        />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/saidas" className="block h-full">
          <SpotlightCard className="h-full cursor-pointer group p-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <Navigation className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{mockStats.totalTripsMonth}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Saídas no Mês</p>
              </div>
            </CardContent>
          </SpotlightCard>
        </Link>
        <Link href="/manutencao" className="block h-full">
          <SpotlightCard className="h-full cursor-pointer group p-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
                <Wrench className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{mockStats.pendingMaintenances}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manutenções</p>
              </div>
            </CardContent>
          </SpotlightCard>
        </Link>
        <Link href="/documentos" className="block h-full">
          <SpotlightCard className="h-full cursor-pointer group p-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-transform group-hover:scale-110">
                <FileText className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{mockStats.expiringDocuments}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Docs Vencendo</p>
              </div>
            </CardContent>
          </SpotlightCard>
        </Link>
        <Link href="/notificacoes" className="block h-full">
          <SpotlightCard className="h-full cursor-pointer group p-0">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 transition-transform group-hover:scale-110">
                <Bell className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{mockStats.unreadNotifications}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Notificações</p>
              </div>
            </CardContent>
          </SpotlightCard>
        </Link>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita vs Despesa Chart */}
        <OverviewChart data={mockMonthlyChart} />

        {/* Rateio do Mês */}
        <Card className="flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Rateio Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-8 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Sua parte este mês</p>
              <div className="inline-flex items-baseline gap-1">
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {formatCurrency(2816.67)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 bg-muted/50 inline-block px-2 py-1 rounded-md">
                Total de {formatCurrency(8450)} ÷ 3 sócios
              </p>
            </div>

            <div className="space-y-4 w-full">
              {[
                { label: 'Fixas', color: 'bg-blue-500', bgToken: 'bg-blue-100 dark:bg-blue-500/20', numColor: 'text-blue-700 dark:text-blue-400', value: 5200, pct: 61 },
                { label: 'Variáveis', color: 'bg-purple-500', bgToken: 'bg-purple-100 dark:bg-purple-500/20', numColor: 'text-purple-700 dark:text-purple-400', value: 2450, pct: 29 },
                { label: 'Individuais', color: 'bg-amber-500', bgToken: 'bg-amber-100 dark:bg-amber-500/20', numColor: 'text-amber-700 dark:text-amber-400', value: 800, pct: 10 },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-md ${item.bgToken}`}>
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      </div>
                      <span className="text-sm text-foreground font-medium">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.numColor}`}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full bg-muted/60 rounded-full h-2 shadow-inner overflow-hidden">
                    <motion.div
                      className={`${item.color} h-full rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1, delay: 0.2, type: "spring" as const, stiffness: 50 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Middle Grid - Expenses + Events */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas Recentes */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Despesas Recentes
            </CardTitle>
            <Link href="/financeiro/despesas">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/50">
              {mockRecentExpenses.map((expense, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={expense.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <Receipt className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryColors[expense.category]}`}>
                          {categoryLabels[expense.category]}
                        </span>
                        {expense.dueDate && (
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(expense.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
                    <p className="text-sm font-bold tracking-tight">{formatCurrency(expense.amount)}</p>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[expense.status]}`}>
                      {statusLabels[expense.status]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              Próximos Eventos
            </CardTitle>
            <Link href="/agenda">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                Ver agenda <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/50">
              {mockUpcomingEvents.map((event, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  key={event.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className={`w-1.5 h-12 rounded-full ${event.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{event.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(event.date)}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold">{event.type === 'manutencao' ? 'Manutenção' : event.type === 'reserva' ? 'Reserva' : 'Lembrete'}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts & Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/10">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Alertas e Notificações
            </CardTitle>
            <Link href="/notificacoes">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {mockNotifications.map((notif, i) => {
                const typeConfig = notifTypeIcons[notif.type] || notifTypeIcons.sistema;
                const Icon = typeConfig.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.4 }}
                    key={notif.id}
                    className="flex flex-col gap-3 p-5 hover:bg-muted/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${typeConfig.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">{formatDate(notif.createdAt)}</span>
                    </div>
                    <div className="flex-1 mt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{notif.title}</p>
                        {notif.priority === 'alta' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Urgente</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notif.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
