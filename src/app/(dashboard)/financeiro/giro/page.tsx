'use client';

import React, { useState, useMemo } from 'react';
import {
  Banknote, Plus, Loader2, AlertCircle, ArrowDownLeft, ArrowUpRight,
  Pencil, Trash2, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyFinancialBoat, useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { turnoverService, beneficiaryService } from '@/services';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import type {
  TurnoverPayment, TurnoverDirection, TurnoverSourceType,
  Beneficiary, PaginatedResponse,
} from '@/types';

const directionLabels: Record<TurnoverDirection, string> = {
  received_by_beneficiary: 'Beneficiário recebeu',
  paid_to_beneficiary: 'Pagamos beneficiário',
};

const sourceLabels: Record<TurnoverSourceType, string> = {
  revenue: 'Receita', expense: 'Despesa', trip: 'Saída',
  maintenance: 'Manutenção', fueling: 'Combustível', manual: 'Manual',
};

export default function GiroPage() {
  const toast = useToast();
  const { boats } = useBoats();
  const canRead = useHasAnyFinancialBoat();
  const canWrite = useHasAnyBoat();
  const [editing, setEditing] = useState<TurnoverPayment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterBeneficiary, setFilterBeneficiary] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterEntered, setFilterEntered] = useState('');

  const { data: paginated, loading, error, refetch } = useApi(
    () => turnoverService.list({
      beneficiaryId: filterBeneficiary || undefined,
      direction: filterDirection || undefined,
      enteredCompanyCash:
        filterEntered === 'true' ? true : filterEntered === 'false' ? false : undefined,
      limit: 100,
    }),
    [filterBeneficiary, filterDirection, filterEntered],
  );
  const payments = (paginated as PaginatedResponse<TurnoverPayment> | null)?.data ?? [];

  const { data: summaryResp } = useApi(
    () => turnoverService.summary({ beneficiaryId: filterBeneficiary || undefined }),
    [filterBeneficiary],
  );
  const summary = summaryResp ?? null;

  const { data: beneficiariesData } = useApi(
    () => beneficiaryService.list({ active: true, limit: 200 }),
    [],
  );
  const beneficiaries = (beneficiariesData as PaginatedResponse<Beneficiary> | null)?.data ?? [];

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, target?: TurnoverPayment) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = Number(form.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.warning('Valor deve ser positivo');
      return;
    }
    const payload = {
      beneficiaryId: String(form.get('beneficiaryId') || ''),
      boatId: (form.get('boatId') as string) || null,
      direction: form.get('direction') as TurnoverDirection,
      sourceType: (form.get('sourceType') as TurnoverSourceType) || 'manual',
      amount,
      date: new Date(String(form.get('date') || todayISO)).toISOString(),
      paymentMethod: String(form.get('paymentMethod') || '') || undefined,
      enteredCompanyCash: form.get('enteredCompanyCash') === 'on',
      description: String(form.get('description') || '') || undefined,
      notes: String(form.get('notes') || '') || undefined,
    };
    if (!payload.beneficiaryId) {
      toast.warning('Selecione um beneficiário');
      return;
    }
    setSaving(true);
    try {
      if (target) {
        await turnoverService.update(target.id, payload);
        toast.success('Pagamento atualizado');
      } else {
        await turnoverService.create(payload);
        toast.success('Pagamento registrado');
      }
      setEditing(null);
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: TurnoverPayment) => {
    if (!confirm('Remover este lançamento de giro?')) return;
    try {
      await turnoverService.delete(p.id);
      toast.success('Removido');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover'));
    }
  };

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">Sem permissão para acessar o módulo Giro.</p>
      </div>
    );
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
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
          <h1 className="text-2xl font-bold">Giro</h1>
          <p className="text-muted-foreground">Pagamentos fora do caixa da empresa, vinculados a beneficiários</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recebido p/ beneficiário"
          value={formatCurrency(summary?.receivedByBeneficiary ?? 0)}
          subtitle="dinheiro foi direto"
          icon={ArrowDownLeft}
          iconBgColor="bg-emerald-50 dark:bg-emerald-500/15"
          iconColor="text-emerald-600 dark:text-emerald-300"
        />
        <StatCard
          title="Pago a beneficiário"
          value={formatCurrency(summary?.paidToBeneficiary ?? 0)}
          subtitle="saiu do giro"
          icon={ArrowUpRight}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
          iconColor="text-amber-600 dark:text-amber-300"
        />
        <StatCard
          title="Fora do caixa"
          value={formatCurrency(summary?.offCompanyCash ?? 0)}
          subtitle="não entrou na empresa"
          icon={XCircle}
          iconBgColor="bg-red-50 dark:bg-red-500/15"
          iconColor="text-red-600 dark:text-red-300"
        />
        <StatCard
          title="Entrou no caixa"
          value={formatCurrency(summary?.enteredCompanyCash ?? 0)}
          subtitle="reconciliado"
          icon={CheckCircle2}
          iconBgColor="bg-nautify-50 dark:bg-nautify-500/15"
          iconColor="text-nautify-600 dark:text-nautify-300"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterBeneficiary} onChange={(e) => setFilterBeneficiary(e.target.value)}>
              <option value="">Todos beneficiários</option>
              {beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)}>
              <option value="">Todas direções</option>
              <option value="received_by_beneficiary">Beneficiário recebeu</option>
              <option value="paid_to_beneficiary">Pagamos beneficiário</option>
            </Select>
            <Select value={filterEntered} onChange={(e) => setFilterEntered(e.target.value)}>
              <option value="">Caixa: todos</option>
              <option value="false">Não entrou no caixa</option>
              <option value="true">Entrou no caixa</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {payments.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="Nenhum lançamento de giro"
          description="Registre quando alguém recebeu/pagou em nome da empresa fora do caixa oficial."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                    <th className="text-left px-4 py-3 font-medium">Beneficiário</th>
                    <th className="text-left px-4 py-3 font-medium">Direção</th>
                    <th className="text-left px-4 py-3 font-medium">Origem</th>
                    <th className="text-left px-4 py-3 font-medium">Embarcação</th>
                    <th className="text-right px-4 py-3 font-medium">Valor</th>
                    <th className="text-center px-4 py-3 font-medium">No caixa</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 font-medium">{p.beneficiaryName ?? p.beneficiaryId}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${p.direction === 'received_by_beneficiary' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
                          {p.direction === 'received_by_beneficiary' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {directionLabels[p.direction]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{sourceLabels[p.sourceType]}</td>
                      <td className="px-4 py-3 text-xs">{p.boatName || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {p.enteredCompanyCash ? (
                          <Badge variant="default">Sim</Badge>
                        ) : (
                          <Badge variant="outline">Não</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canWrite && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(p)} title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} title="Excluir">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(isCreateOpen || editing) && (
        <Modal
          isOpen
          onClose={() => { setEditing(null); setIsCreateOpen(false); }}
          title={editing ? 'Editar Lançamento' : 'Novo Lançamento de Giro'}
        >
          <form className="space-y-4" onSubmit={(e) => handleSave(e, editing ?? undefined)}>
            <Select
              name="beneficiaryId"
              label="Beneficiário *"
              defaultValue={editing?.beneficiaryId ?? ''}
              required
            >
              <option value="">Selecione...</option>
              {beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select name="direction" label="Direção *" defaultValue={editing?.direction ?? 'received_by_beneficiary'}>
                <option value="received_by_beneficiary">Beneficiário recebeu (cliente pagou direto a ele)</option>
                <option value="paid_to_beneficiary">Pagamos ao beneficiário</option>
              </Select>
              <Select name="sourceType" label="Origem" defaultValue={editing?.sourceType ?? 'manual'}>
                {(Object.entries(sourceLabels) as [TurnoverSourceType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="amount"
                label="Valor (R$) *"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={editing?.amount ?? ''}
                required
              />
              <Input
                name="date"
                label="Data *"
                type="date"
                defaultValue={editing?.date?.slice(0, 10) ?? todayISO}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select name="boatId" label="Embarcação" defaultValue={editing?.boatId ?? ''}>
                <option value="">Nenhuma</option>
                {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
              <Input name="paymentMethod" label="Forma de pagamento" placeholder="PIX, dinheiro, transferência..." defaultValue={editing?.paymentMethod ?? ''} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="enteredCompanyCash"
                defaultChecked={editing?.enteredCompanyCash ?? false}
                className="rounded"
              />
              O valor entrou no caixa da empresa (reconcilia com fluxo oficial)
            </label>
            <Input name="description" label="Descrição" defaultValue={editing?.description ?? ''} />
            <Textarea name="notes" label="Observações" rows={2} defaultValue={editing?.notes ?? ''} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setEditing(null); setIsCreateOpen(false); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
