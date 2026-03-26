'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Calendar,
  CreditCard,
  Loader2,
  Ship,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/components/ui/Toast';
import { SUBSCRIPTION_STATUS_META } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { subscriptionService } from '@/services';
import type { Subscription } from '@/types';

export default function AssinaturasPage() {
  const router = useRouter();
  const toast = useToast();
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const { data: subscriptions, loading, error, refetch } = useApi<Subscription[]>(
    () => subscriptionService.list(),
    [],
  );

  const subscriptionList = subscriptions ?? [];
  const activeCount = subscriptionList.filter((subscription) => subscription.status === 'active').length;
  const attentionCount = subscriptionList.filter(
    (subscription) => subscription.status === 'pending' || subscription.status === 'overdue',
  ).length;
  const canceledCount = subscriptionList.filter((subscription) => subscription.status === 'canceled').length;
  const activeValue = subscriptionList
    .filter((subscription) => subscription.status === 'active')
    .reduce((sum, subscription) => sum + subscription.value, 0);

  async function handleCancelSubscription() {
    if (!subscriptionToCancel) return;

    setCancelingId(subscriptionToCancel.id);
    try {
      await subscriptionService.cancel(subscriptionToCancel.id);
      toast.success('Assinatura cancelada com sucesso!');
      setSubscriptionToCancel(null);
      refetch();
    } catch (err) {
      console.error('Erro ao cancelar assinatura:', err);
      toast.error('Erro ao cancelar assinatura.');
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-nautify-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground">Acompanhe o status de cobrança das suas embarcações.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/embarcacoes')}>
          <Ship className="h-4 w-4" />
          Ver embarcações
        </Button>
      </div>

      {subscriptionList.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CreditCard}
              title="Nenhuma assinatura encontrada"
              description="As assinaturas aparecem aqui assim que uma embarcação for criada para você."
              actionLabel="Criar embarcação"
              onAction={() => router.push('/embarcacoes')}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Assinaturas ativas"
              value={String(activeCount)}
              subtitle="em cobrança normal"
              icon={Wallet}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Exigem atenção"
              value={String(attentionCount)}
              subtitle="pendentes ou atrasadas"
              icon={AlertCircle}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Canceladas"
              value={String(canceledCount)}
              subtitle="mantidas no histórico"
              icon={Ban}
              iconBgColor="bg-slate-100"
              iconColor="text-slate-600"
            />
            <StatCard
              title="Valor mensal ativo"
              value={formatCurrency(activeValue)}
              subtitle="somente assinaturas ativas"
              icon={CreditCard}
              iconBgColor="bg-nautify-50"
              iconColor="text-nautify-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {subscriptionList.map((subscription) => {
              const status = SUBSCRIPTION_STATUS_META[subscription.status];
              const planName = subscription.plan?.name || 'Plano Nautify';
              const boatName = subscription.boatName || `Embarcação ${subscription.boatId.slice(0, 8)}`;
              const isCanceling = cancelingId === subscription.id;

              return (
                <Card key={subscription.id} className="border-border/60">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{boatName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{planName}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {status.label}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</p>
                        <p className="mt-2 text-lg font-bold text-foreground">{formatCurrency(subscription.value)}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximo vencimento</p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {subscription.nextDueDate ? formatDate(subscription.nextDueDate) : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cobrança</p>
                        <p className="mt-2 text-lg font-bold text-foreground">{subscription.billingType}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Criada em {formatDate(subscription.createdAt)}
                        </span>
                      </div>

                      <Button
                        variant={status.cancelable ? 'destructive' : 'outline'}
                        onClick={() => setSubscriptionToCancel(subscription)}
                        disabled={!status.cancelable || isCanceling}
                        isLoading={isCanceling}
                      >
                        {status.cancelable ? 'Cancelar assinatura' : 'Assinatura cancelada'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Modal
        isOpen={Boolean(subscriptionToCancel)}
        onClose={() => !cancelingId && setSubscriptionToCancel(null)}
        title="Cancelar assinatura"
        description={
          subscriptionToCancel
            ? `Você está prestes a cancelar a assinatura de ${subscriptionToCancel.boatName || 'esta embarcação'}.`
            : undefined
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
            O cancelamento mantém a assinatura no histórico, mas encerra novas cobranças para essa embarcação.
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setSubscriptionToCancel(null)}
              disabled={Boolean(cancelingId)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleCancelSubscription}
              isLoading={Boolean(cancelingId)}
            >
              Confirmar cancelamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
