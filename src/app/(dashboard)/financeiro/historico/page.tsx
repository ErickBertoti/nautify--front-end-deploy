'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { cashFlowService } from '@/services';
import type { CashFlowEntry } from '@/types';

export default function HistoricoPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBoat, setFilterBoat] = useState('');

  const { data: entries, loading, error, refetch } = useApi<CashFlowEntry[]>(
    () => cashFlowService.listEntries(),
    [],
  );

  const entryList = entries ?? [];

  // Compute monthly totals from the entry data
  const monthlyTotalsMap = new Map<string, { entradas: number; saidas: number }>();
  entryList.forEach((entry) => {
    const d = new Date(entry.date);
    const monthKey = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const formatted = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
    if (!monthlyTotalsMap.has(formatted)) {
      monthlyTotalsMap.set(formatted, { entradas: 0, saidas: 0 });
    }
    const totals = monthlyTotalsMap.get(formatted)!;
    if (entry.type === 'entrada') {
      totals.entradas += entry.amount;
    } else {
      totals.saidas += entry.amount;
    }
  });
  const monthlyTotals = Array.from(monthlyTotalsMap.entries()).map(([month, t]) => ({
    month,
    entradas: t.entradas,
    saidas: t.saidas,
    saldo: t.entradas - t.saidas,
  }));

  const filtered = entryList.filter((entry) => {
    if (search && !entry.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && entry.type !== filterType) return false;
    if (filterBoat && entry.boatName !== filterBoat) return false;
    return true;
  });

  // Collect unique boat names for filter
  const boatNames = Array.from(new Set(entryList.map((e) => e.boatName).filter(Boolean)));

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Histórico Financeiro</h1>
          <p className="text-muted-foreground">Registro completo de todas as movimentações</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {monthlyTotals.map((month) => (
          <Card key={month.month}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{month.month}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-600">Entradas</span>
                  <span className="text-sm font-medium text-emerald-600">{formatCurrency(month.entradas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600">Saídas</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(month.saidas)}</span>
                </div>
                <div className="border-t border-border pt-1 flex justify-between items-center">
                  <span className="text-xs font-medium">Saldo</span>
                  <span className={`text-sm font-bold ${month.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(month.saldo)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar movimentação..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </Select>
            <Select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)}>
              <option value="">Todas embarcações</option>
              {boatNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Descrição</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Embarcação</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Categoria</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {entry.type === 'entrada' ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${entry.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {entry.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-medium">{entry.description}</td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{entry.boatName}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-sm font-semibold ${entry.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
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
