'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import { EmptyState } from '@/components/shared/EmptyState';
import { Wallet } from 'lucide-react';
import { cashFlowService } from '@/services';
import { getCashFlowSourceLabel, getPaymentMethodLabel } from '@/lib/financial';
import type { CashFlowSummary, CashFlowEntry } from '@/types';

function getPeriodDates(period: string): { startDate: string; endDate: string } {
  const [year, month] = [Number(period.slice(0, 4)), Number(period.slice(5, 7)) - 1];
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function getLastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-');
  if (!year || !monthNumber) {
    return month;
  }
  return `${monthNumber}/${year}`;
}

export default function FluxoCaixaPage() {
  const canView = useHasAnyFinancialBoat();
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(defaultPeriod);

  const { startDate, endDate } = getPeriodDates(period);
  const monthOptions = getLastSixMonths();

  const { data: summary, loading: loadingSummary, error: errorSummary, refetch: refetchSummary } = useApi<CashFlowSummary>(
    () => canView
      ? cashFlowService.getSummary({ startDate, endDate })
      : Promise.resolve({ data: null as unknown as CashFlowSummary }),
    [period, canView],
  );

  const { data: entries, loading: loadingEntries, error: errorEntries, refetch: refetchEntries } = useApi<CashFlowEntry[]>(
    () => canView
      ? cashFlowService.listEntries({ startDate, endDate, limit: 200 })
      : Promise.resolve({ data: [] as CashFlowEntry[] }),
    [period, canView],
  );

  const loading = loadingSummary || loadingEntries;
  const error = errorSummary || errorEntries;
  const entryList = entries ?? [];
  const monthlyData = summary?.entriesByMonth ?? [];
  const maxVal = monthlyData.length > 0 ? Math.max(...monthlyData.flatMap((month) => [month.entradas, month.saidas])) : 1;

  const totals = useMemo(() => ({
    entradas: summary?.totalEntradas ?? 0,
    saidas: summary?.totalSaidas ?? 0,
    saldo: summary?.saldo ?? 0,
  }), [summary]);

  if (!canView) {
    return (
      <EmptyState
        icon={Wallet}
        title="Acesso restrito"
        description="Apenas administradores e sócios podem visualizar o fluxo de caixa."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => { refetchSummary(); refetchEntries(); }}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Auditoria de entradas, saídas e reversões financeiras</p>
        </div>
        <Select value={period} onChange={(event) => setPeriod(event.target.value)} className="w-auto">
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Entradas" value={formatCurrency(totals.entradas)} subtitle="lançadas no período" icon={TrendingUp} iconBgColor="bg-emerald-50 dark:bg-emerald-500/15" iconColor="text-emerald-600 dark:text-emerald-300" />
        <StatCard title="Total Saídas" value={formatCurrency(totals.saidas)} subtitle="lançadas no período" icon={TrendingDown} iconBgColor="bg-red-50 dark:bg-red-500/15" iconColor="text-red-600 dark:text-red-300" />
        <StatCard title="Saldo" value={formatCurrency(totals.saldo)} subtitle="resultado líquido" icon={DollarSign} iconBgColor="bg-nautify-50 dark:bg-nautify-500/15" iconColor="text-nautify-700 dark:text-nautify-300" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-52">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 h-40 w-full justify-center">
                  <div
                    className="w-4 rounded-t bg-emerald-400"
                    style={{ height: `${maxVal === 0 ? 0 : (month.entradas / maxVal) * 100}%` }}
                    title={`Entradas: ${formatCurrency(month.entradas)}`}
                  />
                  <div
                    className="w-4 rounded-t bg-red-400"
                    style={{ height: `${maxVal === 0 ? 0 : (month.saidas / maxVal) * 100}%` }}
                    title={`Saídas: ${formatCurrency(month.saidas)}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{formatMonthLabel(month.month)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações do Período</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Origem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Pagador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Barco</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Entrada</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Saída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entryList.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{entry.description}</span>
                        {entry.refundOfEntryId && (
                          <span className="text-xs font-medium text-amber-600">Reversão de lançamento</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getCashFlowSourceLabel(entry)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{entry.paidByUser?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getPaymentMethodLabel(entry.paymentMethod)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{entry.boatName ?? '—'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-emerald-600">
                      {entry.type === 'entrada' ? formatCurrency(entry.amount) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                      {entry.type === 'saida' ? formatCurrency(entry.amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
