'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { expenseService } from '@/services';
import type { Expense } from '@/types';

const categoryColors: Record<string, string> = {
  fixa: 'bg-blue-50 text-blue-700',
  variavel: 'bg-purple-50 text-purple-700',
  individual: 'bg-amber-50 text-amber-700',
};

const categoryLabels: Record<string, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  paga: { color: 'bg-emerald-50 text-emerald-700', label: 'Paga' },
  pendente: { color: 'bg-amber-50 text-amber-700', label: 'Pendente' },
  vencida: { color: 'bg-red-50 text-red-700', label: 'Vencida' },
};

export default function DespesasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const toast = useToast();
  const { boats } = useBoats();

  const { data: expenses, loading, error, refetch } = useApi<Expense[]>(
    () => expenseService.list(),
    [],
  );

  const expenseList = expenses ?? [];

  const total = expenseList.reduce((sum, e) => sum + e.amount, 0);
  const totalPagas = expenseList.filter((e) => e.status === 'paga').reduce((sum, e) => sum + e.amount, 0);
  const totalPendentes = expenseList.filter((e) => e.status === 'pendente').reduce((sum, e) => sum + e.amount, 0);
  const totalVencidas = expenseList.filter((e) => e.status === 'vencida').reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenseList.filter((e) => {
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    return true;
  });

  async function handleCreateExpense(e: React.FormEvent) {
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
      setIsModalOpen(false);
      refetch();
      toast.success('Despesa criada com sucesso!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar despesa.'));
    }
  }

  async function handleMarkAsPaid(id: string) {
    try {
      await expenseService.markAsPaid(id);
      refetch();
      toast.success('Despesa marcada como paga!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao marcar despesa como paga.'));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Controle de saídas financeiras e rateio</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Despesa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={formatCurrency(total)} subtitle="todas despesas" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Pagas" value={formatCurrency(totalPagas)} subtitle="quitadas" icon={CheckCircle} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pendentes" value={formatCurrency(totalPendentes)} subtitle="aguardando" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Vencidas" value={formatCurrency(totalVencidas)} subtitle="em atraso" icon={AlertCircle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Fixas', color: 'bg-blue-500', value: expenseList.filter((e) => e.category === 'fixa').reduce((s, e) => s + e.amount, 0) },
          { label: 'Variáveis', color: 'bg-purple-500', value: expenseList.filter((e) => e.category === 'variavel').reduce((s, e) => s + e.amount, 0) },
          { label: 'Individuais', color: 'bg-amber-500', value: expenseList.filter((e) => e.category === 'individual').reduce((s, e) => s + e.amount, 0) },
        ].map((cat) => (
          <Card key={cat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-1.5 h-12 rounded-full ${cat.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{cat.label}</p>
                <p className="text-lg font-bold">{formatCurrency(cat.value)}</p>
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
              <Input placeholder="Buscar despesa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Todas categorias</option>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="individual">Individual</option>
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos status</option>
              <option value="paga">Paga</option>
              <option value="pendente">Pendente</option>
              <option value="vencida">Vencida</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Descrição</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Embarcação</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Categoria</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Vencimento</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Valor</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((expense) => {
                  const status = statusConfig[expense.status];
                  return (
                    <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm font-medium">{expense.description}</p></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{expense.boatName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[expense.category]}`}>
                          {categoryLabels[expense.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{expense.dueDate ? formatDate(expense.dueDate) : '—'}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-muted-foreground">
                          {expense.splitAmount ? formatCurrency(expense.splitAmount) : '—'} {expense.splitCount ? <span className="text-xs">(÷{expense.splitCount})</span> : null}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        {expense.status === 'pendente' && <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(expense.id)}>Pagar</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Despesa">
        <form className="space-y-4" onSubmit={handleCreateExpense}>
          <Input name="description" label="Descrição" placeholder="Ex: Marina Mensalidade" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="amount" label="Valor (R$)" type="number" placeholder="0,00" required />
            <Select name="category" label="Categoria">
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="individual">Individual</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="boatId" label="Embarcação">
              <option value="">Selecione...</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input name="dueDate" label="Data de Vencimento" type="date" />
          </div>
          <Select label="Modo de Rateio">
            <option value="rateado">Rateado entre sócios</option>
            <option value="exclusivo">Exclusivo</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Despesa</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
