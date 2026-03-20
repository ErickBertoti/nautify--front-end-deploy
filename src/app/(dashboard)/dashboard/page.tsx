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
  Loader2,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useApi } from '@/hooks/useApi';
import { dashboardService } from '@/services';
import type { DashboardStats } from '@/types';

const eventTypeColors: Record<string, string> = {
  manutencao: 'bg-amber-500',
  reserva: 'bg-nautify-500',
  lembrete: 'bg-red-500',
  evento: 'bg-emerald-500',
  outro: 'bg-zinc-500',
};

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

export default function DashboardPage() {
  const { data: stats, loading, error } = useApi<DashboardStats>(
    () => dashboardService.getStats(),
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar dashboard'}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  const recentExpenses = stats.upcomingExpenses || [];
  const upcomingEvents = stats.upcomingEvents || [];
  const monthlyChart = stats.monthlyRevenueVsExpense || [];
  const expensesByCategory = stats.monthlyExpensesByCategory || { fixa: 0, variavel: 0, individual: 0 };
  const totalExpenses = expensesByCategory.fixa + expensesByCategory.variavel + expensesByCategory.individual;

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
          value={formatCurrency(stats.totalRevenueMonth)}
          subtitle="total recebido"
          icon={TrendingUp}
          trend={{ value: 9, isPositive: true }}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(stats.totalExpensesMonth)}
          subtitle="total acumulado"
          icon={TrendingDown}
          trend={{ value: 12, isPositive: false }}
          iconBgColor="bg-red-100 dark:bg-red-500/20"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          title="Saldo do Mês"
          value={formatCurrency(stats.cashFlowBalance)}
          subtitle="receitas - despesas"
          icon={ArrowDownUp}
          iconBgColor="bg-blue-100 dark:bg-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Embarcações"
          value={String(stats.totalBoats)}
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
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.totalTripsMonth}</p>
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
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.pendingMaintenances}</p>
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
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.expiringDocuments}</p>
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
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.unreadNotifications}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Notificações</p>
              </div>
            </CardContent>
          </SpotlightCard>
        </Link>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita vs Despesa Chart */}
        <OverviewChart data={monthlyChart} />

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
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de despesas do mês</p>
              <div className="inline-flex items-baseline gap-1">
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {formatCurrency(stats.totalExpensesMonth)}
                </p>
              </div>
            </div>

            <div className="space-y-4 w-full">
              {[
                { label: 'Fixas', color: 'bg-blue-500', bgToken: 'bg-blue-100 dark:bg-blue-500/20', numColor: 'text-blue-700 dark:text-blue-400', value: expensesByCategory.fixa, pct: totalExpenses > 0 ? Math.round((expensesByCategory.fixa / totalExpenses) * 100) : 0 },
                { label: 'Variáveis', color: 'bg-purple-500', bgToken: 'bg-purple-100 dark:bg-purple-500/20', numColor: 'text-purple-700 dark:text-purple-400', value: expensesByCategory.variavel, pct: totalExpenses > 0 ? Math.round((expensesByCategory.variavel / totalExpenses) * 100) : 0 },
                { label: 'Individuais', color: 'bg-amber-500', bgToken: 'bg-amber-100 dark:bg-amber-500/20', numColor: 'text-amber-700 dark:text-amber-400', value: expensesByCategory.individual, pct: totalExpenses > 0 ? Math.round((expensesByCategory.individual / totalExpenses) * 100) : 0 },
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
              {recentExpenses.map((expense, i) => (
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
              {upcomingEvents.map((event, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  key={event.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className={`w-1.5 h-12 rounded-full ${eventTypeColors[event.type] || eventTypeColors.outro} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{event.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(event.startDate)}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold">{event.type === 'manutencao' ? 'Manutenção' : event.type === 'reserva' ? 'Reserva' : event.type === 'lembrete' ? 'Lembrete' : 'Evento'}</Badge>
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
          <CardContent className="p-6">
            {stats.unreadNotifications > 0 ? (
              <p className="text-sm text-muted-foreground">
                Voce tem <span className="font-bold text-foreground">{stats.unreadNotifications}</span> notificacoes nao lidas.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma notificacao pendente.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
