'use client';

import { useEffect, useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services';
import type { BillingPromotion } from '@/types';
import { AdminSectionHeader, PromotionModeLabel } from '@/components/admin/AdminPrimitives';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

type PromotionRow = BillingPromotion & { searchText: string } & Record<string, unknown>;

const promotionModes = [
  { value: 'fixed_price', label: 'Preco fixo' },
  { value: 'amount_off', label: 'Valor off' },
  { value: 'percent_off', label: 'Percentual off' },
] as const;

const initialForm = {
  code: '',
  name: '',
  mode: 'fixed_price' as BillingPromotion['mode'],
  value: '',
  startsAt: '',
  endsAt: '',
  active: true,
};

export default function AdminPromocoesPage() {
  const { data, loading, error, refetch } = useApi(() => adminService.listPromotions());
  const [editing, setEditing] = useState<BillingPromotion | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm(initialForm);
    }
  }, [open]);

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEdit(item: BillingPromotion) {
    setEditing(item);
    setForm({
      code: item.code,
      name: item.name,
      mode: item.mode,
      value: String(item.value),
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : '',
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : '',
      active: item.active,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        name: form.name,
        mode: form.mode,
        value: Number(form.value),
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        clearStartsAt: Boolean(editing?.startsAt && !form.startsAt),
        clearEndsAt: Boolean(editing?.endsAt && !form.endsAt),
        active: form.active,
      };

      if (editing) {
        await adminService.updatePromotion(editing.id, payload);
      } else {
        await adminService.createPromotion(payload);
      }

      setOpen(false);
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao salvar promocao.');
    } finally {
      setSaving(false);
    }
  }

  const rows: PromotionRow[] = (data ?? []).map((item) => ({
    ...item,
    searchText: `${item.code} ${item.name}`.toLowerCase(),
  }));

  const columns: Column<PromotionRow>[] = [
    {
      key: 'searchText',
      header: 'Promocao',
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{row.code}</p>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.code,
    },
    {
      key: 'mode',
      header: 'Regra',
      render: (row) => <PromotionModeLabel mode={row.mode} value={row.value} />,
    },
    {
      key: 'active',
      header: 'Status',
      render: (row) => <Badge variant={row.active ? 'success' : 'outline'}>{row.active ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      key: 'startsAt',
      header: 'Janela',
      render: (row) => (
        <div className="text-sm">
          <p>{row.startsAt ? formatDate(row.startsAt) : 'Sem inicio'}</p>
          <p className="text-xs text-muted-foreground">{row.endsAt ? formatDate(row.endsAt) : 'Sem fim'}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acoes',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Promotions"
        title="Catalogo de precos promocionais"
        description="Crie regras reaproveitaveis para onboarding comercial e concessoes controladas sem editar gateway manualmente."
        actions={(
          <Button className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova promocao
          </Button>
        )}
      />

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">{error}</div>}

      <Card className="border-white/8 bg-white/4 before:hidden">
        <CardContent className="p-5">
          {loading ? (
            <p className="text-sm text-slate-400">Carregando promocoes...</p>
          ) : (
            <DataTable<PromotionRow>
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              searchableFields={['searchText']}
              emptyTitle="Nenhuma promocao cadastrada"
              emptyDescription="Crie regras promocionais para os primeiros clientes ou ajustes operacionais."
              emptyIcon={Tags}
              renderMobileCard={(row) => (
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{row.name}</p>
                      <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-400">{row.code}</p>
                    </div>
                    <Badge variant={row.active ? 'success' : 'outline'}>{row.active ? 'Ativa' : 'Inativa'}</Badge>
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/6 bg-slate-900/70 p-3 text-sm text-slate-200">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Regra</p>
                    <p className="mt-1"><PromotionModeLabel mode={row.mode} value={row.value} /></p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Inicio</p>
                      <p className="mt-1 text-sm text-white">{row.startsAt ? formatDate(row.startsAt) : 'Sem inicio'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Fim</p>
                      <p className="mt-1 text-sm text-white">{row.endsAt ? formatDate(row.endsAt) : 'Sem fim'}</p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => openEdit(row)}>
                    Editar
                  </Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar promocao' : 'Nova promocao'}
        description="Toda alteracao entra na trilha de auditoria."
        footer={(
          <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button className="w-full sm:w-auto" isLoading={saving} onClick={handleSubmit}>
              Salvar
            </Button>
          </div>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Codigo" value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} />
          <Input label="Nome" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Select
            label="Modo"
            value={form.mode}
            onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as BillingPromotion['mode'] }))}
            options={[...promotionModes]}
          />
          <Input
            label="Valor"
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
          />
          <Input
            label="Inicio"
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
          />
          <Input
            label="Fim"
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
          />
          <Select
            label="Status"
            value={form.active ? 'true' : 'false'}
            onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.value === 'true' }))}
            options={[
              { value: 'true', label: 'Ativa' },
              { value: 'false', label: 'Inativa' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
