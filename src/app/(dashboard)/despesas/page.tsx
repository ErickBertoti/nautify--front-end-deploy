'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { expenseService } from '@/services';
import type { Expense } from '@/types';

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
  const toast = useToast();

  const { data: expenses, loading, error, refetch } = useApi<Expense[]>(
    () => expenseService.list(),
    [],
  );

  const expenseList = expenses ?? [];

  const filtered = expenseList.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'todas' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || e.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPending = expenseList
    .filter((e) => e.status === 'pendente')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaid = expenseList
    .filter((e) => e.status === 'paga')
    .reduce((sum, e) => sum + e.amount, 0);

  // DataTable columns
  const columns: Column<Expense & Record<string, unknown>>[] = useMemo(() => [
    {
      key: 'description',
      header: 'Descrição',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Criado em {formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      sortable: true,
      render: (row) => (
        <div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[row.category]}`}>
            {categoryLabels[row.category]}
          </span>
          {row.individualMode && (
            <span className="block text-[10px] text-muted-foreground mt-0.5">
              {row.individualMode === 'exclusivo' ? 'Exclusivo' : 'Rateado'}
            </span>
          )}
        </div>
      ),
      className: 'hidden md:table-cell',
    },
    {
      key: 'amount',
      header: 'Valor Total',
      sortable: true,
      sortValue: (row) => row.amount,
      render: (row) => <span className="text-sm font-semibold">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'splitAmount',
      header: 'Rateio/Sócio',
      className: 'hidden lg:table-cell',
      render: (row) =>
        row.splitAmount ? (
          <div>
            <span className="text-sm font-medium">{formatCurrency(row.splitAmount)}</span>
            <span className="block text-[10px] text-muted-foreground">÷ {row.splitCount} sócios</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (row) =>
        row.dueDate ? (
          <span className="text-sm text-muted-foreground">{formatDate(row.dueDate)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status]}`}>
          {statusLabels[row.status]}
        </span>
      ),
    },
  ], []);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      await expenseService.create({
        description: formData.get('description') as string,
        amount: Number(formData.get('amount')),
        category: formData.get('category') as Expense['category'],
        dueDate: formData.get('dueDate') as string || undefined,
        boatId: formData.get('boatId') as string,
      });
      setShowAddModal(false);
      toast.success('Despesa registrada com sucesso!');
      refetch();
    } catch {
      toast.error('Erro ao registrar despesa.');
    }
  }

  async function handleMarkAsPaid(id: string) {
    try {
      await expenseService.markAsPaid(id);
      toast.success('Despesa marcada como paga!');
      refetch();
    } catch {
      toast.error('Erro ao marcar despesa como paga.');
    }
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
      <DataTable
        columns={columns}
        data={filtered as (Expense & Record<string, unknown>)[]}
        keyExtractor={(row) => row.id}
        pageSize={10}
        emptyTitle="Nenhuma despesa encontrada"
        emptyDescription="Não encontramos despesas com os filtros aplicados."
        emptyIcon={Receipt}
      />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Despesa"
        description="Registre uma nova despesa para a embarcação"
      >
        <form className="space-y-4 mt-4" onSubmit={handleAddExpense}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select name="boatId" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <Input name="description" label="Descrição" placeholder="Ex: Mensalidade Marina" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="amount" label="Valor (R$)" type="number" placeholder="0,00" step="0.01" required />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Categoria</label>
              <select name="category" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="fixa">Fixa</option>
                <option value="variavel">Variável</option>
                <option value="individual">Individual</option>
              </select>
            </div>
          </div>
          <Input name="dueDate" label="Data de Vencimento" type="date" />
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
