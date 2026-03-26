'use client';

import React, { useState } from 'react';
import {
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { cashFlowService } from '@/services';
import type { CashFlowSummary, CashFlowEntry } from '@/types';

function getPeriodDates(period: string): { startDate: string; endDate: string; label: string } {
  const [y, m] = [parseInt(period.slice(-4)), parseInt(period.slice(0, -4)) - 1];
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const label = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return { startDate: fmt(start), endDate: fmt(end), label: label.charAt(0).toUpperCase() + label.slice(1) };
}

function getLastSixMonths(): { value: string; label: string }[] {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return months;
}

export default function FluxoCaixaPage() {
  const now = new Date();
  const defaultPeriod = `${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
  const [period, setPeriod] = useState(defaultPeriod);

  const { startDate, endDate } = getPeriodDates(period);
  const monthOptions = getLastSixMonths();

  const { data: summary, loading: loadingSummary, error: errorSummary, refetch: refetchSummary } = useApi<CashFlowSummary>(
    () => cashFlowService.getSummary({ startDate, endDate }),
    [period],
  );

  const { data: entries, loading: loadingEntries, error: errorEntries, refetch: refetchEntries } = useApi<CashFlowEntry[]>(
    () => cashFlowService.listEntries({ startDate, endDate }),
    [period],
  );

  const loading = loadingSummary || loadingEntries;
  const error = errorSummary || errorEntries;

  const entryList = entries ?? [];
  const monthlyData = summary?.entriesByMonth ?? [];
  const maxVal = monthlyData.length > 0 ? Math.max(...monthlyData.flatMap((m) => [m.entradas, m.saidas])) : 1;

  const entriesWithBalance = entryList.reduce<(CashFlowEntry & { runningBalance: number })[]>(
    (acc, entry) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].runningBalance : 0;
      const runningBalance = prev + (entry.type === 'entrada' ? entry.amount : -entry.amount);
      acc.push({ ...entry, runningBalance });
      return acc;
    },
    []
  );

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
          <p className="text-muted-foreground">Visão geral de entradas e saídas ao longo do tempo</p>
        </div>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-auto">
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Entradas" value={formatCurrency(summary?.totalEntradas ?? 0)} subtitle="receitas do mês" icon={TrendingUp} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Saídas" value={formatCurrency(summary?.totalSaidas ?? 0)} subtitle="despesas do mês" icon={TrendingDown} iconBgColor="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Saldo" value={formatCurrency(summary?.saldo ?? 0)} subtitle="resultado líquido" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 sm:gap-3 h-52">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-0.5 items-end w-full justify-center h-44">
                  <div
                    className="w-2 sm:w-4 bg-emerald-400 rounded-t transition-all"
                    style={{ height: `${(month.entradas / maxVal) * 100}%` }}
                    title={`Entradas: ${formatCurrency(month.entradas)}`}
                  />
                  <div
                    className="w-2 sm:w-4 bg-red-400 rounded-t transition-all"
                    style={{ height: `${(month.saidas / maxVal) * 100}%` }}
                    title={`Saídas: ${formatCurrency(month.saidas)}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground text-center">{month.month.split('/')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-xs text-muted-foreground">Saídas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações do Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Descrição</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Entrada</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Saída</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entriesWithBalance.map((entry) => {
                  return (
                    <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{formatDate(entry.date)}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          {entry.type === 'entrada' ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium">{entry.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{entry.boatName}</td>
                      <td className="px-6 py-3.5 text-right">
                        {entry.type === 'entrada' && (
                          <span className="text-sm font-medium text-emerald-600">+{formatCurrency(entry.amount)}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {entry.type === 'saida' && (
                          <span className="text-sm font-medium text-red-600">-{formatCurrency(entry.amount)}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${entry.runningBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.runningBalance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
