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
  Receipt,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoatMembers, useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import { useUser } from '@/contexts/UserContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { expenseService } from '@/services';
import { currencyToInputValue, formatCurrencyInput, parseCurrencyInput } from '@/lib/form-formatters';
import { getInstallmentStrategyLabel, getPaymentMethodLabel, getRefundStatusLabel, PAYMENT_METHOD_OPTIONS } from '@/lib/financial';
import type { Expense, ExpenseCategory, ExpenseIndividualMode, InstallmentStrategy, PaymentMethod } from '@/types';

type PaymentMethodSelection = PaymentMethod | '';

const categoryColors: Record<ExpenseCategory, string> = {
  fixa: 'bg-blue-50 text-blue-700',
  variavel: 'bg-purple-50 text-purple-700',
  individual: 'bg-amber-50 text-amber-700',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  fixa: 'Fixa',
  variavel: 'Variável',
  individual: 'Individual',
};

const statusConfig: Record<string, { color: string; label: string }> = {
  paga: { color: 'bg-emerald-50 text-emerald-700', label: 'Paga' },
  pendente: { color: 'bg-amber-50 text-amber-700', label: 'Pendente' },
  vencida: { color: 'bg-red-50 text-red-700', label: 'Vencida' },
};

const initialExpenseForm = {
  boatId: '',
  description: '',
  amount: '',
  category: 'fixa' as ExpenseCategory,
  dueDate: '',
  individualMode: 'rateado' as ExpenseIndividualMode,
  installmentStrategy: 'single' as InstallmentStrategy,
  installmentCount: '1',
};

const initialPaymentForm = {
  paidByUserId: '',
  paymentMethod: '' as PaymentMethodSelection,
  notes: '',
  paidAt: new Date().toISOString().slice(0, 10),
};

const initialRefundForm = {
  refundAmount: '',
  reason: '',
  refundedAt: new Date().toISOString().slice(0, 10),
};

export default function DespesasPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToPay, setExpenseToPay] = useState<Expense | null>(null);
  const [expenseToRefund, setExpenseToRefund] = useState<Expense | null>(null);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [refundForm, setRefundForm] = useState(initialRefundForm);

  const toast = useToast();
  const canView = useHasAnyFinancialBoat();
  const canWrite = canView;
  const { getRoleForBoat } = useUser();
  const { boats } = useBoats();
  const activeBoatId = expenseToPay?.boatId ?? expenseForm.boatId;
  const { socios: boatSocios } = useBoatMembers(activeBoatId);

  const { data: expenses, loading, error, refetch } = useApi<Expense[]>(
    () => canView ? expenseService.list({ limit: 200 }) : Promise.resolve({ data: [] as Expense[] }),
    [canView],
  );

  const expenseList = expenses ?? [];
  const total = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPagas = expenseList.filter((expense) => expense.status === 'paga').reduce((sum, expense) => sum + expense.amount, 0);
  const totalPendentes = expenseList.filter((expense) => expense.status === 'pendente').reduce((sum, expense) => sum + expense.amount, 0);
  const totalVencidas = expenseList.filter((expense) => expense.status === 'vencida').reduce((sum, expense) => sum + expense.amount, 0);

  const filtered = expenseList.filter((expense) => {
    if (search && !expense.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterCategory && expense.category !== filterCategory) {
      return false;
    }
    if (filterStatus && expense.status !== filterStatus) {
      return false;
    }
    return true;
  });

  function canDeleteExpense(expense: Expense) {
    return getRoleForBoat(expense.boatId) === 'admin';
  }

  function resetExpenseForm() {
    setEditingExpense(null);
    setExpenseForm(initialExpenseForm);
    setIsFormOpen(false);
  }

  function openCreateModal() {
    setEditingExpense(null);
    setExpenseForm(initialExpenseForm);
    setIsFormOpen(true);
  }

  function openEditModal(expense: Expense) {
    setEditingExpense(expense);
    setExpenseForm({
      boatId: expense.boatId,
      description: expense.description,
      amount: currencyToInputValue(expense.amount),
      category: expense.category,
      dueDate: expense.dueDate?.slice(0, 10) ?? '',
      individualMode: expense.individualMode ?? 'rateado',
      installmentStrategy: expense.installmentStrategy ?? 'single',
      installmentCount: String(expense.installmentCount || 1),
    });
    setIsFormOpen(true);
  }

  function openPayModal(expense: Expense) {
    setExpenseToPay(expense);
    setPaymentForm({
      paidByUserId: expense.paidByUserId ?? expense.responsibleUserId ?? '',
      paymentMethod: expense.paymentMethod ?? '',
      notes: expense.paymentNotes ?? '',
      paidAt: expense.paidAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    });
  }

  function openRefundModal(expense: Expense) {
    setExpenseToRefund(expense);
    setRefundForm({
      refundAmount: currencyToInputValue(expense.amount),
      reason: expense.refundReason ?? '',
      refundedAt: new Date().toISOString().slice(0, 10),
    });
  }

  async function handleSubmitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      boatId: expenseForm.boatId,
      description: expenseForm.description,
      amount: parseCurrencyInput(expenseForm.amount),
      category: expenseForm.category,
      dueDate: expenseForm.dueDate || undefined,
      individualMode: expenseForm.individualMode,
      installmentStrategy: expenseForm.installmentStrategy,
      installmentCount: expenseForm.installmentStrategy === 'single' ? 1 : Math.max(1, Number(expenseForm.installmentCount) || 1),
    };

    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.id, payload);
        toast.success('Despesa atualizada com sucesso.');
      } else {
        await expenseService.create(payload);
        toast.success('Despesa criada com sucesso.');
      }
      resetExpenseForm();
      refetch();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Erro ao salvar despesa.'));
    }
  }

  async function handleDeleteExpense() {
    if (!expenseToDelete) {
      return;
    }

    try {
      await expenseService.delete(expenseToDelete.id);
      setExpenseToDelete(null);
      refetch();
      toast.success('Despesa excluída com sucesso.');
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Erro ao excluir despesa.'));
    }
  }

  async function handlePayExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expenseToPay) {
      return;
    }

    try {
      await expenseService.markAsPaid(expenseToPay.id, {
        paidByUserId: paymentForm.paidByUserId || undefined,
        paymentMethod: paymentForm.paymentMethod || undefined,
        notes: paymentForm.notes || undefined,
        paidAt: paymentForm.paidAt ? `${paymentForm.paidAt}T00:00:00Z` : undefined,
      });
      setExpenseToPay(null);
      setPaymentForm(initialPaymentForm);
      refetch();
      toast.success('Pagamento registrado com sucesso.');
    } catch (paymentError) {
      toast.error(getErrorMessage(paymentError, 'Erro ao registrar pagamento.'));
    }
  }

  async function handleRefundExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expenseToRefund) {
      return;
    }

    try {
      await expenseService.refund(expenseToRefund.id, {
        refundAmount: parseCurrencyInput(refundForm.refundAmount),
        reason: refundForm.reason || undefined,
        refundedAt: refundForm.refundedAt ? `${refundForm.refundedAt}T00:00:00Z` : undefined,
      });
      setExpenseToRefund(null);
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
        icon={Receipt}
        title="Acesso restrito"
        description="Apenas administradores e sócios podem visualizar as despesas."
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
          <h1 className="text-2xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">CRUD completo, parcelamento e rastreio de pagamento</p>
        </div>
        {canWrite && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" /> Nova Despesa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={formatCurrency(total)} subtitle="todas as despesas" icon={DollarSign} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Pagas" value={formatCurrency(totalPagas)} subtitle="quitadas" icon={CheckCircle} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Pendentes" value={formatCurrency(totalPendentes)} subtitle="aguardando" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Vencidas" value={formatCurrency(totalVencidas)} subtitle="em atraso" icon={AlertCircle} iconBgColor="bg-red-50" iconColor="text-red-600" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar despesa..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
            <Select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
              <option value="">Todas as categorias</option>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="individual">Individual</option>
            </Select>
            <Select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="">Todos os status</option>
              <option value="paga">Paga</option>
              <option value="pendente">Pendente</option>
              <option value="vencida">Vencida</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Embarcação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Parcelamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Pagamento</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((expense) => {
                  const status = statusConfig[expense.status];
                  return (
                    <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{expense.description}</span>
                          {expense.refundStatus !== 'none' && (
                            <span className="text-xs font-medium text-amber-600">{getRefundStatusLabel(expense.refundStatus)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{expense.boatName ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[expense.category]}`}>
                          {categoryLabels[expense.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {getInstallmentStrategyLabel(expense.installmentStrategy)}
                        {expense.installmentCount > 1 && (
                          <span className="ml-1 text-xs">({expense.installmentIndex}/{expense.installmentCount})</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{expense.dueDate ? formatDate(expense.dueDate) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {expense.status === 'paga' ? (
                          <div className="flex flex-col gap-1">
                            <span>{expense.paidByUser?.name ?? 'Pagamento lançado'}</span>
                            <span className="text-xs">{getPaymentMethodLabel(expense.paymentMethod)}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {expense.status !== 'paga' && (
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(expense)}>Editar</Button>
                          )}
                          {canDeleteExpense(expense) && (
                            <Button variant="ghost" size="sm" onClick={() => setExpenseToDelete(expense)}>Excluir</Button>
                          )}
                          {expense.status !== 'paga' && (
                            <Button variant="ghost" size="sm" onClick={() => openPayModal(expense)}>Pagar</Button>
                          )}
                          {expense.status === 'paga' && expense.refundStatus === 'none' && (
                            <Button variant="ghost" size="sm" onClick={() => openRefundModal(expense)}>Reembolsar</Button>
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

      <Modal isOpen={isFormOpen} onClose={resetExpenseForm} title={editingExpense ? 'Editar despesa' : 'Nova despesa'}>
        <form className="space-y-4" onSubmit={handleSubmitExpense}>
          <Input label="Descrição" value={expenseForm.description} onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor"
              value={expenseForm.amount}
              onChange={(event) => setExpenseForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
              placeholder="R$ 0,00"
              required
            />
            <Select label="Categoria" value={expenseForm.category} onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value as ExpenseCategory }))}>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="individual">Individual</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Embarcação" value={expenseForm.boatId} onChange={(event) => setExpenseForm((current) => ({ ...current, boatId: event.target.value }))} required>
              <option value="">Selecione...</option>
              {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </Select>
            <Input label="Vencimento" type="date" value={expenseForm.dueDate} onChange={(event) => setExpenseForm((current) => ({ ...current, dueDate: event.target.value }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Modo de Rateio" value={expenseForm.individualMode} onChange={(event) => setExpenseForm((current) => ({ ...current, individualMode: event.target.value as ExpenseIndividualMode }))}>
              <option value="rateado">Rateado entre sócios</option>
              <option value="exclusivo">Exclusivo</option>
            </Select>
            <Select label="Parcelamento" value={expenseForm.installmentStrategy} onChange={(event) => setExpenseForm((current) => ({ ...current, installmentStrategy: event.target.value as InstallmentStrategy }))}>
              <option value="single">À vista</option>
              <option value="generated">Gerar parcelas</option>
              <option value="metadata_only">Só registrar metadados</option>
            </Select>
          </div>
          {expenseForm.installmentStrategy !== 'single' && (
            <Input
              label="Quantidade de parcelas"
              type="number"
              min={2}
              value={expenseForm.installmentCount}
              onChange={(event) => setExpenseForm((current) => ({ ...current, installmentCount: event.target.value }))}
            />
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={resetExpenseForm}>Cancelar</Button>
            <Button type="submit" className="flex-1">{editingExpense ? 'Salvar alterações' : 'Criar despesa'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={expenseToPay !== null} onClose={() => setExpenseToPay(null)} title="Registrar pagamento">
        <form className="space-y-4" onSubmit={handlePayExpense}>
          <Select label="Quem pagou" value={paymentForm.paidByUserId} onChange={(event) => setPaymentForm((current) => ({ ...current, paidByUserId: event.target.value }))} required>
            <option value="">Selecione...</option>
            {boatSocios.map((member) => (
              <option key={member.user.id} value={member.user.id}>{member.user.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Método de pagamento" value={paymentForm.paymentMethod} onChange={(event) => setPaymentForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethodSelection }))} required>
              <option value="">Selecione...</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <Input label="Data do pagamento" type="date" value={paymentForm.paidAt} onChange={(event) => setPaymentForm((current) => ({ ...current, paidAt: event.target.value }))} />
          </div>
          <Textarea label="Observações" value={paymentForm.notes} onChange={(event) => setPaymentForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setExpenseToPay(null)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Confirmar pagamento</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={expenseToRefund !== null} onClose={() => setExpenseToRefund(null)} title="Registrar reembolso">
        <form className="space-y-4" onSubmit={handleRefundExpense}>
          <Input
            label="Valor do reembolso"
            value={refundForm.refundAmount}
            onChange={(event) => setRefundForm((current) => ({ ...current, refundAmount: formatCurrencyInput(event.target.value) }))}
            required
          />
          <Input label="Data do reembolso" type="date" value={refundForm.refundedAt} onChange={(event) => setRefundForm((current) => ({ ...current, refundedAt: event.target.value }))} />
          <Textarea label="Motivo" value={refundForm.reason} onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setExpenseToRefund(null)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar reembolso</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Excluir despesa"
        description={expenseToDelete ? `A despesa "${expenseToDelete.description}" será removida permanentemente.` : undefined}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  );
}
