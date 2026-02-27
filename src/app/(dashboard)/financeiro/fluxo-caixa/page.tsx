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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockSummary = {
  totalEntradas: 17900,
  totalSaidas: 12880,
  saldo: 5020,
};

const mockMonthlyData = [
  { month: 'Set/2025', entradas: 9800, saidas: 8200, saldo: 1600 },
  { month: 'Out/2025', entradas: 10200, saidas: 7800, saldo: 2400 },
  { month: 'Nov/2025', entradas: 11500, saidas: 9200, saldo: 2300 },
  { month: 'Dez/2025', entradas: 13000, saidas: 10500, saldo: 2500 },
  { month: 'Jan/2026', entradas: 11800, saidas: 8900, saldo: 2900 },
  { month: 'Fev/2026', entradas: 12600, saidas: 8450, saldo: 4150 },
  { month: 'Mar/2026', entradas: 17900, saidas: 12880, saldo: 5020 },
];

const mockEntries = [
  { id: '1', type: 'entrada', description: 'Mensalidade Gabriel - Mar/2026', amount: 4200, date: '2026-03-01', boatName: 'Mar Azul' },
  { id: '2', type: 'saida', description: 'Marina Mensalidade', amount: 3200, date: '2026-03-02', boatName: 'Mar Azul' },
  { id: '3', type: 'entrada', description: 'Aluguel evento corporativo', amount: 3500, date: '2026-03-03', boatName: 'Veleiro Sol' },
  { id: '4', type: 'saida', description: 'Manutenção Motor', amount: 1850, date: '2026-03-04', boatName: 'Mar Azul' },
  { id: '5', type: 'entrada', description: 'Mensalidade Pedro - Mar/2026', amount: 4200, date: '2026-03-05', boatName: 'Mar Azul' },
  { id: '6', type: 'saida', description: 'Seguro Anual', amount: 4500, date: '2026-03-05', boatName: 'Veleiro Sol' },
  { id: '7', type: 'entrada', description: 'Mensalidade Lucas - Mar/2026', amount: 4200, date: '2026-03-05', boatName: 'Mar Azul' },
  { id: '8', type: 'saida', description: 'Limpeza do casco', amount: 650, date: '2026-03-06', boatName: 'Mar Azul' },
  { id: '9', type: 'entrada', description: 'Taxa evento corporativo', amount: 1800, date: '2026-03-07', boatName: 'Veleiro Sol' },
  { id: '10', type: 'saida', description: 'Combustível', amount: 480, date: '2026-03-07', boatName: 'Mar Azul' },
  { id: '11', type: 'saida', description: 'Troca de vela', amount: 2200, date: '2026-03-08', boatName: 'Veleiro Sol' },
];

export default function FluxoCaixaPage() {
  const [period, setPeriod] = useState('mar2026');
  const maxVal = Math.max(...mockMonthlyData.flatMap((m) => [m.entradas, m.saidas]));

  const entriesWithBalance = mockEntries.reduce<(typeof mockEntries[number] & { runningBalance: number })[]>(
    (acc, entry) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].runningBalance : 0;
      const runningBalance = prev + (entry.type === 'entrada' ? entry.amount : -entry.amount);
      acc.push({ ...entry, runningBalance });
      return acc;
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Visão geral de entradas e saídas ao longo do tempo</p>
        </div>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-auto">
          <option value="mar2026">Março 2026</option>
          <option value="fev2026">Fevereiro 2026</option>
          <option value="jan2026">Janeiro 2026</option>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Entradas" value={formatCurrency(mockSummary.totalEntradas)} subtitle="receitas do mês" icon={TrendingUp} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Saídas" value={formatCurrency(mockSummary.totalSaidas)} subtitle="despesas do mês" icon={TrendingDown} iconBgColor="bg-red-50" iconColor="text-red-600" />
        <StatCard title="Saldo" value={formatCurrency(mockSummary.saldo)} subtitle="resultado líquido" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
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
            {mockMonthlyData.map((month) => (
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
