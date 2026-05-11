'use client';

import React, { useMemo, useState } from 'react';
import {
  History,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import { EmptyState } from '@/components/shared/EmptyState';
import { Wallet } from 'lucide-react';
import { cashFlowService } from '@/services';
import { getCashFlowSourceLabel, getPaymentMethodLabel } from '@/lib/financial';
import type { CashFlowEntry } from '@/types';

function getMonthSummary(entries: CashFlowEntry[]) {
  const monthlyMap = new Map<string, { entradas: number; saidas: number }>();

  for (const entry of entries) {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyMap.get(key) ?? { entradas: 0, saidas: 0 };
    if (entry.type === 'entrada') {
      current.entradas += entry.amount;
    } else {
      current.saidas += entry.amount;
    }
    monthlyMap.set(key, current);
  }

  return Array.from(monthlyMap.entries()).map(([month, value]) => ({
    month,
    entradas: value.entradas,
    saidas: value.saidas,
    saldo: value.entradas - value.saidas,
  }));
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-');
  return `${monthNumber}/${year}`;
}

export default function HistoricoPage() {
  const canView = useHasAnyFinancialBoat();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBoat, setFilterBoat] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const { data: entries, loading, error, refetch } = useApi<CashFlowEntry[]>(
    () => canView ? cashFlowService.listEntries({ limit: 300 }) : Promise.resolve({ data: [] as CashFlowEntry[] }),
    [canView],
  );

  const entryList = entries ?? [];
  const monthlyTotals = useMemo(() => getMonthSummary(entryList), [entryList]);
  const boatNames = Array.from(new Set(entryList.map((entry) => entry.boatName).filter(Boolean))) as string[];

  const filtered = entryList.filter((entry) => {
    if (search && !entry.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterType && entry.type !== filterType) {
      return false;
    }
    if (filterBoat && entry.boatName !== filterBoat) {
      return false;
    }
    if (filterSource && getCashFlowSourceLabel(entry) !== filterSource) {
      return false;
    }
    return true;
  });

  if (!canView) {
    return (
      <EmptyState
        icon={Wallet}
        title="Acesso restrito"
        description="Apenas administradores e sócios podem visualizar o histórico financeiro."
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
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico Financeiro</h1>
        <p className="text-muted-foreground">Registro completo de lançamentos, pagadores, métodos e reversões</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {monthlyTotals.map((month) => (
          <Card key={month.month}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{formatMonth(month.month)}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Entradas</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(month.entradas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Saídas</span>
                  <span className="font-medium text-red-600">{formatCurrency(month.saidas)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="font-medium">Saldo</span>
                  <span className={month.saldo >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                    {formatCurrency(month.saldo)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar movimentação..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </Select>
            <Select value={filterSource} onChange={(event) => setFilterSource(event.target.value)}>
              <option value="">Todas as origens</option>
              <option value="Despesa">Despesa</option>
              <option value="Receita">Receita</option>
              <option value="Contribuição">Contribuição</option>
            </Select>
            <Select value={filterBoat} onChange={(event) => setFilterBoat(event.target.value)}>
              <option value="">Todas embarcações</option>
              {boatNames.map((boatName) => (
                <option key={boatName} value={boatName}>{boatName}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Origem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Pagador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Barco</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Observação</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getCashFlowSourceLabel(entry)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{entry.paidByUser?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{getPaymentMethodLabel(entry.paymentMethod)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{entry.boatName ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {entry.refundOfEntryId ? 'Reembolso / reversão' : 'Lançamento original'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={entry.type === 'entrada' ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-red-600'}>
                        {entry.type === 'entrada' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </span>
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
