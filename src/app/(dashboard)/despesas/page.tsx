'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense } from '@/types';

const mockExpenses: Expense[] = [
  {
    id: '1',
    boatId: '1',
    description: 'Marina Mensalidade - Fev/2026',
    amount: 3200,
    category: 'fixa',
    status: 'pendente',
    splitCount: 3,
    splitAmount: 1066.67,
    dueDate: '2026-03-05',
    createdBy: '1',
    createdAt: '2026-02-01',
  },
  {
    id: '2',
    boatId: '1',
    description: 'Manutenção Motor - Troca de Óleo',
    amount: 1850,
    category: 'variavel',
    status: 'paga',
    splitCount: 3,
    splitAmount: 616.67,
    createdBy: '1',
    createdAt: '2026-02-15',
  },
  {
    id: '3',
    boatId: '1',
    description: 'Seguro Anual Embarcação',
    amount: 4500,
    category: 'fixa',
    status: 'pendente',
    splitCount: 3,
    splitAmount: 1500,
    dueDate: '2026-03-01',
    createdBy: '1',
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    boatId: '1',
    description: 'Salário Marinheiro - Fev/2026',
    amount: 2500,
    category: 'fixa',
    status: 'paga',
    splitCount: 3,
    splitAmount: 833.33,
    createdBy: '1',
    createdAt: '2026-02-01',
  },
  {
    id: '5',
    boatId: '1',
    description: 'Dano Casco - Arranhão Lateral',
    amount: 800,
    category: 'individual',
    individualMode: 'exclusivo',
    status: 'pendente',
    createdBy: '1',
    createdAt: '2026-02-26',
  },
  {
    id: '6',
    boatId: '1',
    description: 'Limpeza Geral',
    amount: 350,
    category: 'variavel',
    status: 'paga',
    splitCount: 3,
    splitAmount: 116.67,
    createdBy: '1',
    createdAt: '2026-02-10',
  },
];

const categoryColors: Record<string, string> = {
  fixa: 'bg-blue-50 text-blue-700',
  variavel: 'bg-purple-50 text-purple-700',
  individual: 'bg-amber-50 text-amber-700',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-700',
  paga: 'bg-emerald-50 text-emerald-700',
  vencida: 'bg-red-50 text-red-700',
};

const categoryLabels: Record<string, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  paga: 'Paga',
  vencida: 'Vencida',
};

export default function DespesasPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = mockExpenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'todas' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || e.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPending = mockExpenses
    .filter((e) => e.status === 'pendente')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaid = mockExpenses
    .filter((e) => e.status === 'paga')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground">Controle de despesas fixas, variáveis e individuais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total do Mês</p>
            <p className="text-xl font-bold">{formatCurrency(totalPending + totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendente</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pago</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar despesa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todas">Todas categorias</option>
          <option value="fixa">Fixas</option>
          <option value="variavel">Variáveis</option>
          <option value="individual">Individuais</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos status</option>
          <option value="pendente">Pendente</option>
          <option value="paga">Paga</option>
          <option value="vencida">Vencida</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                      Descrição
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Categoria
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Valor Total
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Rateio/Sócio
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Vencimento
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Criado em {formatDate(expense.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            categoryColors[expense.category]
                          }`}
                        >
                          {categoryLabels[expense.category]}
                        </span>
                        {expense.individualMode && (
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {expense.individualMode === 'exclusivo' ? 'Exclusivo' : 'Rateado'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {expense.splitAmount ? (
                          <div>
                            <span className="text-sm font-medium">{formatCurrency(expense.splitAmount)}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              ÷ {expense.splitCount} sócios
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {expense.dueDate ? (
                          <span className="text-sm text-muted-foreground">{formatDate(expense.dueDate)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[expense.status]
                          }`}
                        >
                          {statusLabels[expense.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Nenhuma despesa encontrada"
          description="Não encontramos despesas com os filtros aplicados."
          actionLabel="Nova Despesa"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Despesa"
        description="Registre uma nova despesa para a embarcação"
      >
        <form className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <Input label="Descrição" placeholder="Ex: Mensalidade Marina" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" placeholder="0,00" step="0.01" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Categoria</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="fixa">Fixa</option>
                <option value="variavel">Variável</option>
                <option value="individual">Individual</option>
              </select>
            </div>
          </div>
          <Input label="Data de Vencimento" type="date" />
          <Textarea label="Observações" placeholder="Detalhes adicionais (opcional)" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Despesa</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
