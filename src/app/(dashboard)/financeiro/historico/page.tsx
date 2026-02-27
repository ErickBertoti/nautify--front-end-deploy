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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockHistory = [
  { id: '1', type: 'saida', description: 'Marina Mensalidade - Jan/2026', amount: 3200, date: '2026-01-05', boatName: 'Mar Azul', category: 'fixa' },
  { id: '2', type: 'entrada', description: 'Mensalidade Gabriel - Jan/2026', amount: 4200, date: '2026-01-01', boatName: 'Mar Azul', category: 'mensalidade' },
  { id: '3', type: 'saida', description: 'Combustível Jan', amount: 890, date: '2026-01-12', boatName: 'Mar Azul', category: 'variavel' },
  { id: '4', type: 'entrada', description: 'Aluguel fim de semana', amount: 2500, date: '2026-01-15', boatName: 'Veleiro Sol', category: 'aluguel' },
  { id: '5', type: 'saida', description: 'Seguro Trimestral', amount: 1500, date: '2026-01-20', boatName: 'Mar Azul', category: 'fixa' },
  { id: '6', type: 'entrada', description: 'Mensalidade Pedro - Jan/2026', amount: 4200, date: '2026-01-01', boatName: 'Mar Azul', category: 'mensalidade' },
  { id: '7', type: 'saida', description: 'Reparo elétrico', amount: 750, date: '2026-01-25', boatName: 'Veleiro Sol', category: 'variavel' },
  { id: '8', type: 'saida', description: 'Marina Mensalidade - Fev/2026', amount: 3200, date: '2026-02-05', boatName: 'Mar Azul', category: 'fixa' },
  { id: '9', type: 'entrada', description: 'Mensalidade Gabriel - Fev/2026', amount: 4200, date: '2026-02-01', boatName: 'Mar Azul', category: 'mensalidade' },
  { id: '10', type: 'saida', description: 'Manutenção Motor', amount: 1850, date: '2026-02-15', boatName: 'Mar Azul', category: 'variavel' },
  { id: '11', type: 'entrada', description: 'Mensalidade Pedro - Fev/2026', amount: 4200, date: '2026-02-01', boatName: 'Mar Azul', category: 'mensalidade' },
  { id: '12', type: 'saida', description: 'Limpeza do casco', amount: 650, date: '2026-02-20', boatName: 'Mar Azul', category: 'variavel' },
];

const monthlyTotals = [
  { month: 'Janeiro 2026', entradas: 10900, saidas: 6340, saldo: 4560 },
  { month: 'Fevereiro 2026', entradas: 12600, saidas: 8450, saldo: 4150 },
  { month: 'Março 2026', entradas: 17900, saidas: 12880, saldo: 5020 },
];

export default function HistoricoPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBoat, setFilterBoat] = useState('');

  const filtered = mockHistory.filter((entry) => {
    if (search && !entry.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && entry.type !== filterType) return false;
    if (filterBoat && entry.boatName !== filterBoat) return false;
    return true;
  });

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
              <option value="Mar Azul">Mar Azul</option>
              <option value="Veleiro Sol">Veleiro Sol</option>
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
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                        {entry.category}
                      </span>
                    </td>
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
