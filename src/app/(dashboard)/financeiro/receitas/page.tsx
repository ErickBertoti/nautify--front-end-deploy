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
import { revenueService } from '@/services';
import type { Revenue } from '@/types';

const categoryColors: Record<string, string> = {
  mensalidade: 'bg-blue-50 text-blue-700',
  aluguel: 'bg-purple-50 text-purple-700',
  evento: 'bg-emerald-50 text-emerald-700',
  taxa: 'bg-amber-50 text-amber-700',
  outro: 'bg-gray-50 text-gray-700',
};

const categoryLabels: Record<string, string> = {
  mensalidade: 'Mensalidade',
  aluguel: 'Aluguel',
  evento: 'Evento',
  taxa: 'Taxa',
  outro: 'Outro',
};

const statusConfig: Record<string, { color: string; label: string; icon: typeof CheckCircle }> = {
  recebida: { color: 'bg-emerald-50 text-emerald-700', label: 'Recebida', icon: CheckCircle },
  pendente: { color: 'bg-amber-50 text-amber-700', label: 'Pendente', icon: Clock },
  atrasada: { color: 'bg-red-50 text-red-700', label: 'Atrasada', icon: AlertCircle },
};

export default function ReceitasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const toast = useToast();
  const { boats } = useBoats();

  const { data: revenues, loading, error, refetch } = useApi<Revenue[]>(
    () => revenueService.list(),
    [],
  );

  const revenueList = revenues ?? [];

  const totalRecebidas = revenueList.filter((r) => r.status === 'recebida').reduce((sum, r) => sum + r.amount, 0);
  const totalPendentes = revenueList.filter((r) => r.status === 'pendente').reduce((sum, r) => sum + r.amount, 0);
  const totalAtrasadas = revenueList.filter((r) => r.status === 'atrasada').reduce((sum, r) => sum + r.amount, 0);
  const total = revenueList.reduce((sum, r) => sum + r.amount, 0);

  const filtered = revenueList.filter((r) => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  async function handleCreateRevenue(e: React.FormEvent) {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      await revenueService.create({
        description: formData.get('description') as string,
        amount: Number(formData.get('amount')),
        category: formData.get('category') as Revenue['category'],
        dueDate: formData.get('dueDate') as string || undefined,
        boatId: formData.get('boatId') as string,
      });
      setIsModalOpen(false);
      refetch();
      toast.success('Receita criada com sucesso!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar receita.'));
    }
  }

  async function handleMarkAsReceived(id: string) {
    try {
      await revenueService.markAsReceived(id);
      refetch();
      toast.success('Receita marcada como recebida!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao confirmar recebimento.'));
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
          <h1 className="text-2xl font-bold">Receitas</h1>
          <p className="text-muted-foreground">Controle de entradas financeiras</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Receita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={formatCurrency(total)} subtitle="todas receitas" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Recebidas" value={formatCurrency(totalRecebidas)} subtitle="pagas" icon={CheckCircle} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pendentes" value={formatCurrency(totalPendentes)} subtitle="aguardando" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Atrasadas" value={formatCurrency(totalAtrasadas)} subtitle="vencidas" icon={AlertCircle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar receita..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Todas categorias</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="aluguel">Aluguel</option>
              <option value="evento">Evento</option>
              <option value="taxa">Taxa</option>
              <option value="outro">Outro</option>
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos status</option>
              <option value="recebida">Recebida</option>
              <option value="pendente">Pendente</option>
              <option value="atrasada">Atrasada</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
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
                {filtered.map((revenue) => {
                  const status = statusConfig[revenue.status];
                  return (
                    <tr key={revenue.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{revenue.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{revenue.boatName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[revenue.category]}`}>
                          {categoryLabels[revenue.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{revenue.dueDate ? formatDate(revenue.dueDate) : '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-emerald-600">{formatCurrency(revenue.amount)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {revenue.status !== 'recebida' && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsReceived(revenue.id)}>Confirmar</Button>
                        )}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Receita">
        <form className="space-y-4" onSubmit={handleCreateRevenue}>
          <Input name="description" label="Descrição" placeholder="Ex: Mensalidade Sócio" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="amount" label="Valor (R$)" type="number" placeholder="0,00" required />
            <Select name="category" label="Categoria">
              <option value="mensalidade">Mensalidade</option>
              <option value="aluguel">Aluguel</option>
              <option value="evento">Evento</option>
              <option value="taxa">Taxa</option>
              <option value="outro">Outro</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="boatId" label="Embarcação">
              <option value="">Selecione...</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input name="dueDate" label="Data de Vencimento" type="date" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Receita</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
