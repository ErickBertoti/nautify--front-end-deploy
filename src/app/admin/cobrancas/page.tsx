'use client';

import { useEffect, useState } from 'react';
import { CreditCard, RefreshCcw, Tag, WalletCards } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService, planService } from '@/services';
import type { AdminSubscriptionSummary, BillingPromotion, Plan } from '@/types';
import { AdminSectionHeader, SubscriptionStatusBadge } from '@/components/admin/AdminPrimitives';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';

type PricingAction = 'price' | 'plan' | 'cancel' | 'reactivate' | null;

type SubscriptionRow = AdminSubscriptionSummary & { searchText: string } & Record<string, unknown>;

export default function AdminCobrancasPage() {
  const subscriptionsApi = useApi(() => adminService.listSubscriptions());
  const promotionsApi = useApi(() => adminService.listPromotions());
  const plansApi = useApi(() => planService.list());

  const [selected, setSelected] = useState<AdminSubscriptionSummary | null>(null);
  const [action, setAction] = useState<PricingAction>(null);
  const [manualValue, setManualValue] = useState('');
  const [selectedPromotionId, setSelectedPromotionId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!selected) {
      setManualValue('');
      setSelectedPromotionId('');
      setSelectedPlanId('');
      setReason('');
      setActionError('');
    }
  }, [selected]);

  const eligiblePromotions = (promotionsApi.data ?? []).filter(isPromotionEligible);

  async function submitAction() {
    if (!selected || !action) return;
    setSaving(true);
    setActionError('');
    try {
      if (action === 'price') {
        await adminService.updateSubscriptionPrice(selected.id, {
          value: manualValue ? Number(manualValue) : undefined,
          promotionId: selectedPromotionId || undefined,
          reason,
        });
      } else if (action === 'plan') {
        await adminService.updateSubscriptionPlan(selected.id, {
          planId: selectedPlanId,
          reason,
        });
      } else if (action === 'cancel') {
        await adminService.cancelSubscription(selected.id);
      } else if (action === 'reactivate') {
        await adminService.reactivateSubscription(selected.id);
      }

      setSelected(null);
      setAction(null);
      await subscriptionsApi.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao aplicar alteracao.');
    } finally {
      setSaving(false);
    }
  }

  const rows: SubscriptionRow[] = (subscriptionsApi.data ?? []).map((item) => ({
    ...item,
    searchText: `${item.ownerName} ${item.ownerEmail} ${item.boatName || ''} ${item.plan?.name || ''}`.toLowerCase(),
  }));

  const columns: Column<SubscriptionRow>[] = [
    {
      key: 'searchText',
      header: 'Cliente / embarcacao',
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.ownerName}</p>
          <p className="text-xs text-muted-foreground">{row.ownerEmail}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{row.boatName || row.boatId}</p>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.ownerName,
    },
    {
      key: 'plan',
      header: 'Plano',
      render: (row) => (
        <div>
          <p className="text-sm">{row.plan?.name || row.planId}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(row.value)}</p>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.value,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <SubscriptionStatusBadge status={row.status} />,
      sortable: true,
      sortValue: (row) => row.status,
    },
    {
      key: 'latestSync',
      header: 'Ultimo sync',
      render: (row) => (
        row.latestPriceChange ? (
          <div className="text-sm">
            <p>{row.latestPriceChange.syncStatus}</p>
            <p className="text-xs text-muted-foreground">{formatDate(row.latestPriceChange.createdAt)}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sem historico</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acoes',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSelected(row); setAction('price'); }}>
            <Tag className="h-3.5 w-3.5" /> Ajustar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setSelected(row); setAction('plan'); setSelectedPlanId(row.planId); }}>
            <WalletCards className="h-3.5 w-3.5" /> Plano
          </Button>
          {row.status === 'canceled' ? (
            <Button size="sm" variant="secondary" onClick={() => { setSelected(row); setAction('reactivate'); }}>
              <RefreshCcw className="h-3.5 w-3.5" /> Reativar
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => { setSelected(row); setAction('cancel'); }}>
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Billing Control"
        title="Cobrancas, planos e precos efetivos"
        description="Ajuste assinatura por assinatura, aplique promocao, troque plano e sincronize o valor real com o gateway."
      />

      {(subscriptionsApi.error || promotionsApi.error || plansApi.error) && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">
          {subscriptionsApi.error || promotionsApi.error || plansApi.error}
        </div>
      )}

      <Card className="border-white/8 bg-white/4 before:hidden">
        <CardContent className="p-5">
          {subscriptionsApi.loading ? (
            <p className="text-sm text-slate-400">Carregando cobrancas...</p>
          ) : (
            <DataTable<SubscriptionRow>
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              searchableFields={['searchText']}
              emptyTitle="Nenhuma assinatura encontrada"
              emptyDescription="Quando houver assinaturas elas aparecerao aqui."
              emptyIcon={CreditCard}
              renderMobileCard={(row) => (
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{row.ownerName}</p>
                      <p className="break-all text-xs text-slate-400">{row.ownerEmail}</p>
                    </div>
                    <SubscriptionStatusBadge status={row.status} />
                  </div>

                  <p className="mt-3 truncate text-xs uppercase tracking-[0.16em] text-slate-500">
                    {row.boatName || row.boatId}
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Plano</p>
                      <p className="mt-1 text-sm text-white">{row.plan?.name || row.planId}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatCurrency(row.value)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Ultimo sync</p>
                      <p className="mt-1 text-sm text-white">{row.latestPriceChange?.syncStatus || 'Sem historico'}</p>
                      {row.latestPriceChange && (
                        <p className="mt-1 text-xs text-slate-400">{formatDate(row.latestPriceChange.createdAt)}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => { setSelected(row); setAction('price'); }}>
                      <Tag className="h-3.5 w-3.5" /> Ajustar
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => { setSelected(row); setAction('plan'); setSelectedPlanId(row.planId); }}>
                      <WalletCards className="h-3.5 w-3.5" /> Plano
                    </Button>
                    {row.status === 'canceled' ? (
                      <Button size="sm" variant="secondary" className="w-full sm:col-span-2" onClick={() => { setSelected(row); setAction('reactivate'); }}>
                        <RefreshCcw className="h-3.5 w-3.5" /> Reativar
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" className="w-full sm:col-span-2" onClick={() => { setSelected(row); setAction('cancel'); }}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(selected && action)}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title={
          action === 'price' ? 'Ajustar valor' :
            action === 'plan' ? 'Trocar plano' :
              action === 'cancel' ? 'Cancelar assinatura' :
                action === 'reactivate' ? 'Reativar assinatura' : undefined
        }
        description={selected ? `${selected.ownerName} • ${selected.boatName || selected.boatId}` : undefined}
        footer={(
          <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => { setSelected(null); setAction(null); }}>
              Fechar
            </Button>
            <Button
              variant={action === 'cancel' ? 'destructive' : 'secondary'}
              className="w-full sm:w-auto"
              isLoading={saving}
              onClick={submitAction}
              disabled={action === 'plan' && !selectedPlanId}
            >
              Confirmar
            </Button>
          </div>
        )}
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p>Valor atual: <span className="font-medium text-foreground">{formatCurrency(selected.value)}</span></p>
              <p className="mt-1">Status: <span className="font-medium text-foreground">{selected.status}</span></p>
            </div>

            {action === 'price' && (
              <>
                <Input
                  label="Novo valor manual"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 79.90"
                  value={manualValue}
                  onChange={(event) => setManualValue(event.target.value)}
                />
                <Select
                  label="Ou aplique uma promocao"
                  value={selectedPromotionId}
                  onChange={(event) => setSelectedPromotionId(event.target.value)}
                  options={[
                    { value: '', label: 'Sem promocao preset' },
                    ...eligiblePromotions.map((promotion: BillingPromotion) => ({
                      value: promotion.id,
                      label: `${promotion.code} • ${promotion.name}`,
                    })),
                  ]}
                />
              </>
            )}

            {action === 'plan' && (
              <Select
                label="Novo plano"
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
                options={(plansApi.data ?? []).map((plan: Plan) => ({
                  value: plan.id,
                  label: `${plan.name} • ${formatCurrency(plan.price)}`,
                }))}
              />
            )}

            {(action === 'price' || action === 'plan') && (
              <Textarea
                label="Motivo"
                placeholder="Contexto para auditoria e suporte"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            )}

            {actionError && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-3 text-sm text-rose-200">
                {actionError}
              </div>
            )}

            {(action === 'cancel' || action === 'reactivate') && (
              <p className="text-sm text-muted-foreground">
                Esta operacao executa uma mutacao administrativa e fica registrada na trilha de auditoria.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function isPromotionEligible(promotion: BillingPromotion) {
  if (!promotion.active) {
    return false;
  }

  const now = Date.now();
  if (promotion.startsAt && new Date(promotion.startsAt).getTime() > now) {
    return false;
  }
  if (promotion.endsAt && new Date(promotion.endsAt).getTime() < now) {
    return false;
  }

  return true;
}
