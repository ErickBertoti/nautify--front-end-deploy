'use client';

import React, { useState, useMemo } from 'react';
import {
  Banknote, Plus, Loader2, AlertCircle, Pencil, Trash2,
  TrendingDown, Wallet, XCircle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { beneficiaryPaymentService, beneficiaryService } from '@/services';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import type {
  BeneficiaryPayment, BeneficiaryPaymentOrigin,
  Beneficiary, PaginatedResponse,
} from '@/types';

const originLabels: Record<BeneficiaryPaymentOrigin, string> = {
  manual: 'Manual',
  trip: 'Saída',
  maintenance: 'Manutenção',
};

const originColors: Record<BeneficiaryPaymentOrigin, string> = {
  manual:      'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
  trip:        'bg-nautify-50 text-nautify-700 dark:bg-nautify-500/15 dark:text-nautify-300',
  maintenance: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};

export default function PagarNoGiroPage() {
  const toast = useToast();
  const { boats } = useBoats();
  const canRead = useHasAnyFinancialBoat();
  const canWrite = useHasAnyBoat();

  const [editing, setEditing] = useState<BeneficiaryPayment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterBeneficiary, setFilterBeneficiary] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterEntered, setFilterEntered] = useState('');
  const [filterBoat, setFilterBoat] = useState('');

  const { data: paginated, loading, error, refetch } = useApi(
    () => beneficiaryPaymentService.list({
      beneficiaryId: filterBeneficiary || undefined,
      origin: filterOrigin || undefined,
      enteredCompanyCash:
        filterEntered === 'true' ? true : filterEntered === 'false' ? false : undefined,
      boatId: filterBoat || undefined,
      limit: 100,
    }),
    [filterBeneficiary, filterOrigin, filterEntered, filterBoat],
  );
  const payments = (paginated as PaginatedResponse<BeneficiaryPayment> | null)?.data ?? [];

  const { data: summaryResp } = useApi(
    () => beneficiaryPaymentService.summary({
      beneficiaryId: filterBeneficiary || undefined,
      boatId: filterBoat || undefined,
    }),
    [filterBeneficiary, filterBoat],
  );
  const summary = summaryResp ?? null;

  const { data: beneficiariesData } = useApi(
    () => beneficiaryService.list({ active: true, limit: 200 }),
    [],
  );
  const beneficiaries = (beneficiariesData as PaginatedResponse<Beneficiary> | null)?.data ?? [];

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, target?: BeneficiaryPayment) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = Number(form.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.warning('Valor deve ser positivo');
      return;
    }
    const boatId = String(form.get('boatId') || '');
    if (!boatId) {
      toast.warning('Embarcação obrigatória');
      return;
    }
    const beneficiaryId = String(form.get('beneficiaryId') || '');
    if (!beneficiaryId) {
      toast.warning('Selecione um beneficiário');
      return;
    }
    const paidAtRaw = String(form.get('paidAt') || todayISO);
    const payload = {
      boatId,
      beneficiaryId,
      amount,
      paidAt: new Date(paidAtRaw).toISOString(),
      enteredCompanyCash: form.get('enteredCompanyCash') === 'on',
      origin: (form.get('origin') as BeneficiaryPaymentOrigin) || 'manual',
      paymentMethod: String(form.get('paymentMethod') || '') || undefined,
      notes: String(form.get('notes') || '') || undefined,
    };

    setSaving(true);
    try {
      if (target) {
        await beneficiaryPaymentService.update(target.id, payload);
        toast.success('Pagamento atualizado');
      } else {
        await beneficiaryPaymentService.create(payload);
        toast.success('Pagamento registrado');
      }
      setEditing(null);
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar pagamento'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: BeneficiaryPayment) => {
    if (!confirm(`Remover pagamento de ${formatCurrency(p.amount)} para ${p.beneficiaryName ?? 'beneficiário'}?`)) return;
    try {
      await beneficiaryPaymentService.delete(p.id);
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
        <p className="text-sm text-muted-foreground">Sem permissão para acessar Pagar no Giro.</p>
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
          <h1 className="text-2xl font-bold">Pagar no Giro</h1>
          <p className="text-muted-foreground">Saídas de caixa para beneficiários (mecânicos, fornecedores, marinheiros…)</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Pagamento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total pago"
          value={formatCurrency(summary?.total ?? 0)}
          subtitle={`${summary?.count ?? 0} lançamentos`}
          icon={TrendingDown}
          iconBgColor="bg-red-50 dark:bg-red-500/15"
          iconColor="text-red-600 dark:text-red-300"
        />
        <StatCard
          title="No giro (fora caixa)"
          value={formatCurrency(summary?.offCompanyCash ?? 0)}
          subtitle="não passou no caixa"
          icon={XCircle}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
          iconColor="text-amber-600 dark:text-amber-300"
        />
        <StatCard
          title="No caixa oficial"
          value={formatCurrency(summary?.enteredCompanyCash ?? 0)}
          subtitle="reconciliado"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-500/15"
          iconColor="text-emerald-600 dark:text-emerald-300"
        />
        <StatCard
          title="Beneficiários"
          value={String(summary?.perBeneficiary.length ?? 0)}
          subtitle="distintos no período"
          icon={Wallet}
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
            <Select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)}>
              <option value="">Todas embarcações</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)}>
              <option value="">Todas origens</option>
              {(Object.entries(originLabels) as [BeneficiaryPaymentOrigin, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select value={filterEntered} onChange={(e) => setFilterEntered(e.target.value)}>
              <option value="">Caixa: todos</option>
              <option value="false">Fora do caixa (giro)</option>
              <option value="true">No caixa oficial</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {payments.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="Nenhum pagamento"
              description="Registre pagamentos feitos a beneficiários (com ou sem passagem pelo caixa)."
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
                        <th className="text-left px-4 py-3 font-medium">Embarcação</th>
                        <th className="text-left px-4 py-3 font-medium">Origem</th>
                        <th className="text-right px-4 py-3 font-medium">Valor</th>
                        <th className="text-center px-4 py-3 font-medium">Caixa</th>
                        <th className="text-right px-4 py-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">{formatDate(p.paidAt)}</td>
                          <td className="px-4 py-3 font-medium">{p.beneficiaryName ?? p.beneficiaryId}</td>
                          <td className="px-4 py-3 text-xs">{p.boatName || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${originColors[p.origin]}`}>
                              {originLabels[p.origin]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            {p.enteredCompanyCash
                              ? <Badge variant="default">Sim</Badge>
                              : <Badge variant="outline">Não</Badge>}
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top beneficiários</CardTitle>
          </CardHeader>
          <CardContent>
            {!summary || summary.perBeneficiary.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem pagamentos no período.</p>
            ) : (
              <ul className="space-y-3">
                {summary.perBeneficiary.map((row) => (
                  <li key={row.beneficiaryId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.beneficiaryName}</p>
                      <p className="text-[11px] text-muted-foreground">{row.count} lançamento{row.count > 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(row.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {(isCreateOpen || editing) && (
        <Modal
          isOpen
          onClose={() => { setEditing(null); setIsCreateOpen(false); }}
          title={editing ? 'Editar Pagamento' : 'Novo Pagamento no Giro'}
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
              <Select name="boatId" label="Embarcação *" defaultValue={editing?.boatId ?? ''} required>
                <option value="">Selecione...</option>
                {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
              <Select name="origin" label="Origem" defaultValue={editing?.origin ?? 'manual'}>
                {(Object.entries(originLabels) as [BeneficiaryPaymentOrigin, string][]).map(([k, v]) => (
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
                name="paidAt"
                label="Data do pagamento *"
                type="date"
                defaultValue={editing?.paidAt?.slice(0, 10) ?? todayISO}
                required
              />
            </div>
            <Input
              name="paymentMethod"
              label="Forma de pagamento"
              placeholder="PIX, dinheiro, transferência…"
              defaultValue={editing?.paymentMethod ?? ''}
            />
            <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="enteredCompanyCash"
                defaultChecked={editing?.enteredCompanyCash ?? false}
                className="rounded mt-0.5"
              />
              <span>
                Esse pagamento saiu do <strong>caixa oficial da empresa</strong>
                <span className="block text-xs text-muted-foreground">
                  Desmarque quando o dinheiro veio do giro (sem passar pela conta da empresa).
                </span>
              </span>
            </label>
            <Textarea name="notes" label="Observações" rows={2} defaultValue={editing?.notes ?? ''} />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setEditing(null); setIsCreateOpen(false); }}
              >
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
