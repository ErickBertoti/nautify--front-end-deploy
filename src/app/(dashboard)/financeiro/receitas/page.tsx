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
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoatMembers, useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import { useUser } from '@/contexts/UserContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { revenueService } from '@/services';
import { currencyToInputValue, formatCurrencyInput, parseCurrencyInput } from '@/lib/form-formatters';
import { getPaymentMethodLabel, getRefundStatusLabel, PAYMENT_METHOD_OPTIONS } from '@/lib/financial';
import type { PaymentMethod, Revenue, RevenueCategory } from '@/types';

type PaymentMethodSelection = PaymentMethod | '';

const categoryColors: Record<RevenueCategory, string> = {
  mensalidade: 'bg-blue-50 text-blue-700',
  aluguel: 'bg-purple-50 text-purple-700',
  evento: 'bg-emerald-50 text-emerald-700',
  taxa: 'bg-amber-50 text-amber-700',
  outro: 'bg-gray-50 text-gray-700',
};

const categoryLabels: Record<RevenueCategory, string> = {
  mensalidade: 'Mensalidade',
  aluguel: 'Aluguel',
  evento: 'Evento',
  taxa: 'Taxa',
  outro: 'Outro',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  recebida: { color: 'bg-emerald-50 text-emerald-700', label: 'Recebida' },
  pendente: { color: 'bg-amber-50 text-amber-700', label: 'Pendente' },
  atrasada: { color: 'bg-red-50 text-red-700', label: 'Atrasada' },
};

const initialRevenueForm = {
  boatId: '',
  description: '',
  amount: '',
  category: 'mensalidade' as RevenueCategory,
  dueDate: '',
  payerUserId: '',
};

const initialReceiveForm = {
  payerUserId: '',
  paymentMethod: '' as PaymentMethodSelection,
  notes: '',
  receivedAt: new Date().toISOString().slice(0, 10),
};

const initialRefundForm = {
  refundAmount: '',
  reason: '',
  refundedAt: new Date().toISOString().slice(0, 10),
};

export default function ReceitasPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [revenueForm, setRevenueForm] = useState(initialRevenueForm);
  const [revenueToDelete, setRevenueToDelete] = useState<Revenue | null>(null);
  const [revenueToReceive, setRevenueToReceive] = useState<Revenue | null>(null);
  const [revenueToRefund, setRevenueToRefund] = useState<Revenue | null>(null);
  const [receiveForm, setReceiveForm] = useState(initialReceiveForm);
  const [refundForm, setRefundForm] = useState(initialRefundForm);

  const toast = useToast();
  const canView = useHasAnyFinancialBoat();
  const canWrite = canView;
  const { getRoleForBoat } = useUser();
  const { boats } = useBoats();
  const activeBoatId = revenueToReceive?.boatId ?? revenueForm.boatId;
  const { socios: boatSocios } = useBoatMembers(activeBoatId);

  const { data: revenues, loading, error, refetch } = useApi<Revenue[]>(
    () => canView ? revenueService.list({ limit: 200 }) : Promise.resolve({ data: [] as Revenue[] }),
    [canView],
  );

  const revenueList = revenues ?? [];
  const totalRecebidas = revenueList.filter((revenue) => revenue.status === 'recebida').reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalPendentes = revenueList.filter((revenue) => revenue.status === 'pendente').reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalAtrasadas = revenueList.filter((revenue) => revenue.status === 'atrasada').reduce((sum, revenue) => sum + revenue.amount, 0);
  const total = revenueList.reduce((sum, revenue) => sum + revenue.amount, 0);

  const filtered = revenueList.filter((revenue) => {
    if (search && !revenue.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterCategory && revenue.category !== filterCategory) {
      return false;
    }
    if (filterStatus && revenue.status !== filterStatus) {
      return false;
    }
    return true;
  });

  function canDeleteRevenue(revenue: Revenue) {
    return getRoleForBoat(revenue.boatId) === 'admin';
  }

  function closeForm() {
    setEditingRevenue(null);
    setRevenueForm(initialRevenueForm);
    setIsFormOpen(false);
  }

  function openCreateModal() {
    setEditingRevenue(null);
    setRevenueForm(initialRevenueForm);
    setIsFormOpen(true);
  }

  function openEditModal(revenue: Revenue) {
    setEditingRevenue(revenue);
    setRevenueForm({
      boatId: revenue.boatId,
      description: revenue.description,
      amount: currencyToInputValue(revenue.amount),
      category: revenue.category,
      dueDate: revenue.dueDate?.slice(0, 10) ?? '',
      payerUserId: revenue.payerUserId ?? '',
    });
    setIsFormOpen(true);
  }

  function openReceiveModal(revenue: Revenue) {
    setRevenueToReceive(revenue);
    setReceiveForm({
      payerUserId: revenue.payerUserId ?? '',
      paymentMethod: revenue.paymentMethod ?? '',
      notes: revenue.paymentNotes ?? '',
      receivedAt: revenue.receivedDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    });
  }

  function openRefundModal(revenue: Revenue) {
    setRevenueToRefund(revenue);
    setRefundForm({
      refundAmount: currencyToInputValue(revenue.amount),
      reason: revenue.refundReason ?? '',
      refundedAt: new Date().toISOString().slice(0, 10),
    });
  }

  async function handleSubmitRevenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      boatId: revenueForm.boatId,
      description: revenueForm.description,
      amount: parseCurrencyInput(revenueForm.amount),
      category: revenueForm.category,
      dueDate: revenueForm.dueDate || undefined,
      payerUserId: revenueForm.payerUserId || undefined,
    };

    try {
      if (editingRevenue) {
        await revenueService.update(editingRevenue.id, payload);
        toast.success('Receita atualizada com sucesso.');
      } else {
        await revenueService.create(payload);
        toast.success('Receita criada com sucesso.');
      }
      closeForm();
      refetch();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Erro ao salvar receita.'));
    }
  }

  async function handleDeleteRevenue() {
    if (!revenueToDelete) {
      return;
    }

    try {
      await revenueService.delete(revenueToDelete.id);
      setRevenueToDelete(null);
      refetch();
      toast.success('Receita excluída com sucesso.');
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Erro ao excluir receita.'));
    }
  }

  async function handleReceiveRevenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!revenueToReceive) {
      return;
    }

    try {
      await revenueService.markAsReceived(revenueToReceive.id, {
        payerUserId: receiveForm.payerUserId || undefined,
        paymentMethod: receiveForm.paymentMethod || undefined,
        notes: receiveForm.notes || undefined,
        receivedAt: receiveForm.receivedAt ? `${receiveForm.receivedAt}T00:00:00-03:00` : undefined,
      });
      setRevenueToReceive(null);
      setReceiveForm(initialReceiveForm);
      refetch();
      toast.success('Recebimento registrado com sucesso.');
    } catch (receiveError) {
      toast.error(getErrorMessage(receiveError, 'Erro ao confirmar recebimento.'));
    }
  }

  async function handleRefundRevenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!revenueToRefund) {
      return;
    }

    try {
      await revenueService.refund(revenueToRefund.id, {
        refundAmount: parseCurrencyInput(refundForm.refundAmount),
        reason: refundForm.reason || undefined,
        refundedAt: refundForm.refundedAt ? `${refundForm.refundedAt}T00:00:00-03:00` : undefined,
      });
      setRevenueToRefund(null);
      setRefundForm(initialRefundForm);
      refetch();
      toast.success('Reembolso registrado com sucesso.');
    } catch (refundError) {
      toast.error(getErrorMessage(refundError, 'Erro ao registrar reembolso.'));
    }
  }

  if (!canView) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Acesso restrito"
        description="Apenas administradores e sócios podem visualizar as receitas."
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Receitas</h1>
          <p className="text-muted-foreground">CRUD completo, pagador identificado e rastreio de reembolso</p>
        </div>
        {canWrite && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" /> Nova Receita
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={formatCurrency(total)} subtitle="todas as receitas" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Recebidas" value={formatCurrency(totalRecebidas)} subtitle="confirmadas" icon={CheckCircle} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pendentes" value={formatCurrency(totalPendentes)} subtitle="aguardando" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Atrasadas" value={formatCurrency(totalAtrasadas)} subtitle="vencidas" icon={AlertCircle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar receita..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <Select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
              <option value="">Todas as categorias</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="aluguel">Aluguel</option>
              <option value="evento">Evento</option>
              <option value="taxa">Taxa</option>
              <option value="outro">Outro</option>
            </Select>
            <Select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="">Todos os status</option>
              <option value="recebida">Recebida</option>
              <option value="pendente">Pendente</option>
              <option value="atrasada">Atrasada</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Embarcação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Pagador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Vencimento</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((revenue) => {
                  const status = statusConfig[revenue.status];
                  return (
                    <tr key={revenue.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{revenue.description}</span>
                          {revenue.refundStatus !== 'none' && (
                            <span className="text-xs font-medium text-amber-600">{getRefundStatusLabel(revenue.refundStatus)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{revenue.boatName ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[revenue.category]}`}>
                          {categoryLabels[revenue.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{revenue.payerUser?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{getPaymentMethodLabel(revenue.paymentMethod)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{revenue.dueDate ? formatDate(revenue.dueDate) : '—'}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-600">{formatCurrency(revenue.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {revenue.status !== 'recebida' && (
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(revenue)}>Editar</Button>
                          )}
                          {canDeleteRevenue(revenue) && (
                            <Button variant="ghost" size="sm" onClick={() => setRevenueToDelete(revenue)}>Excluir</Button>
                          )}
                          {revenue.status !== 'recebida' && (
                            <Button variant="ghost" size="sm" onClick={() => openReceiveModal(revenue)}>Receber</Button>
                          )}
                          {revenue.status === 'recebida' && revenue.refundStatus === 'none' && (
                            <Button variant="ghost" size="sm" onClick={() => openRefundModal(revenue)}>Reembolsar</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={editingRevenue ? 'Editar receita' : 'Nova receita'}>
        <form className="space-y-4" onSubmit={handleSubmitRevenue}>
          <Input label="Descrição" value={revenueForm.description} onChange={(event) => setRevenueForm((current) => ({ ...current, description: event.target.value }))} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor"
              value={revenueForm.amount}
              onChange={(event) => setRevenueForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
              placeholder="R$ 0,00"
              required
            />
            <Select label="Categoria" value={revenueForm.category} onChange={(event) => setRevenueForm((current) => ({ ...current, category: event.target.value as RevenueCategory }))}>
              <option value="mensalidade">Mensalidade</option>
              <option value="aluguel">Aluguel</option>
              <option value="evento">Evento</option>
              <option value="taxa">Taxa</option>
              <option value="outro">Outro</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Embarcação" value={revenueForm.boatId} onChange={(event) => setRevenueForm((current) => ({ ...current, boatId: event.target.value }))} required>
              <option value="">Selecione...</option>
              {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </Select>
            <Input label="Vencimento" type="date" value={revenueForm.dueDate} onChange={(event) => setRevenueForm((current) => ({ ...current, dueDate: event.target.value }))} />
          </div>
          <Select label="Pagador previsto" value={revenueForm.payerUserId} onChange={(event) => setRevenueForm((current) => ({ ...current, payerUserId: event.target.value }))}>
            <option value="">Selecione...</option>
            {boatSocios.map((member) => (
              <option key={member.user.id} value={member.user.id}>{member.user.name}</option>
            ))}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" className="flex-1">{editingRevenue ? 'Salvar alterações' : 'Criar receita'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={revenueToReceive !== null} onClose={() => setRevenueToReceive(null)} title="Confirmar recebimento">
        <form className="space-y-4" onSubmit={handleReceiveRevenue}>
          <Select label="Quem pagou" value={receiveForm.payerUserId} onChange={(event) => setReceiveForm((current) => ({ ...current, payerUserId: event.target.value }))} required>
            <option value="">Selecione...</option>
            {boatSocios.map((member) => (
              <option key={member.user.id} value={member.user.id}>{member.user.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Método de pagamento" value={receiveForm.paymentMethod} onChange={(event) => setReceiveForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethodSelection }))} required>
              <option value="">Selecione...</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <Input label="Data do recebimento" type="date" value={receiveForm.receivedAt} onChange={(event) => setReceiveForm((current) => ({ ...current, receivedAt: event.target.value }))} />
          </div>
          <Textarea label="Observações" value={receiveForm.notes} onChange={(event) => setReceiveForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setRevenueToReceive(null)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Confirmar recebimento</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={revenueToRefund !== null} onClose={() => setRevenueToRefund(null)} title="Registrar reembolso">
        <form className="space-y-4" onSubmit={handleRefundRevenue}>
          <Input
            label="Valor do reembolso"
            value={refundForm.refundAmount}
            onChange={(event) => setRefundForm((current) => ({ ...current, refundAmount: formatCurrencyInput(event.target.value) }))}
            required
          />
          <Input label="Data do reembolso" type="date" value={refundForm.refundedAt} onChange={(event) => setRefundForm((current) => ({ ...current, refundedAt: event.target.value }))} />
          <Textarea label="Motivo" value={refundForm.reason} onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setRevenueToRefund(null)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar reembolso</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={revenueToDelete !== null}
        onClose={() => setRevenueToDelete(null)}
        onConfirm={handleDeleteRevenue}
        title="Excluir receita"
        description={revenueToDelete ? `A receita "${revenueToDelete.description}" será removida permanentemente.` : undefined}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
