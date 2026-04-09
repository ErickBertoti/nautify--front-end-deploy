'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminService, planService } from '@/services';
import type { Plan } from '@/types';
import { AdminSectionHeader } from '@/components/admin/AdminPrimitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPlanosPage() {
  const { data, loading, error, refetch } = useApi(() => planService.list());
  const [selected, setSelected] = useState<Plan | null>(null);
  const [price, setPrice] = useState('');
  const [propagate, setPropagate] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  function openPlan(plan: Plan) {
    setSelected(plan);
    setPrice(String(plan.price));
    setPropagate(false);
    setReason('');
    setResultMessage('');
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const result = await adminService.updatePlan(selected.id, {
        price: Number(price),
        propagateToExisting: propagate,
        reason,
      });
      setResultMessage(
        propagate
          ? `${result.data.propagated} assinaturas propagadas, ${result.data.failed} falhas.`
          : 'Preco-base atualizado para novos clientes.'
      );
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao atualizar plano.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Plans"
        title="Preco-base dos planos"
        description="Altere o valor padrao de entrada e decida se a mudanca deve propagar para assinaturas existentes."
      />

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">{error}</div>}

      <div className="grid gap-4 xl:grid-cols-2">
        {(data ?? []).map((plan) => (
          <Card key={plan.id} className="border-white/8 bg-white/4 before:hidden">
            <CardHeader className="border-white/8">
              <CardTitle className="flex items-center justify-between gap-4 text-white">
                <span>{plan.name}</span>
                <span className="text-sm text-slate-400">{plan.code}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preco atual</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(plan.price)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ciclo</p>
                  <p className="mt-2 text-sm text-white">{plan.billingCycle}</p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Criado em</p>
                  <p className="mt-2 text-sm text-white">{formatDate(plan.createdAt)}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => openPlan(plan)}>
                Editar preco
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-400">Carregando planos...</div>}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Editar ${selected.name}` : undefined}
        description="A propagacao so altera assinaturas nao canceladas."
      >
        {selected && (
          <div className="space-y-4">
            <Input
              label="Novo preco"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <Select
              label="Propagacao"
              value={propagate ? 'true' : 'false'}
              onChange={(event) => setPropagate(event.target.value === 'true')}
              options={[
                { value: 'false', label: 'Apenas novos clientes' },
                { value: 'true', label: 'Propagar para assinaturas existentes' },
              ]}
            />
            <Textarea
              label="Motivo"
              placeholder="Motivo comercial ou operacional"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            {resultMessage && <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{resultMessage}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button isLoading={saving} onClick={handleSave}>
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
