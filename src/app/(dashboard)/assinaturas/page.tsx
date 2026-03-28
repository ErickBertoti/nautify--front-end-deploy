'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { differenceInDays, parseISO } from 'date-fns';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCanWrite } from '@/hooks/useCanWrite';
import { subscriptionService } from '@/services';
import type { Subscription } from '@/types';

const PAYMENT_POLL_INTERVAL_MS = 3000;
const PAYMENT_POLL_TIMEOUT_MS = 30000;

export default function AssinaturasPage() {
  const router = useRouter();
  const toast = useToast();
  const canWrite = useCanWrite();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const handledReturnRef = useRef<string | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingDeadlineRef = useRef(0);

  const clearPaymentPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    pollingDeadlineRef.current = 0;
  }, []);

  const loadSubscriptions = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await subscriptionService.list();
      const nextSubscriptions = res.data ?? [];
      setSubscriptions(nextSubscriptions);
      return nextSubscriptions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      if (!silent) {
        setError(message);
      }
      return null;
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const pollPaymentStatus = useCallback(async (subscriptionId: string) => {
    if (Date.now() >= pollingDeadlineRef.current) {
      toast.info('Pagamento recebido. A assinatura ainda esta sendo processada.');
      clearPaymentPolling();
      return;
    }

    const latestSubscriptions = await loadSubscriptions({ silent: true });
    const currentSubscription = latestSubscriptions?.find((subscription) => subscription.id === subscriptionId);

    if (currentSubscription?.status === 'active') {
      toast.success('Pagamento confirmado e assinatura ativada.');
      clearPaymentPolling();
      return;
    }

    pollingTimerRef.current = setTimeout(() => {
      void pollPaymentStatus(subscriptionId);
    }, PAYMENT_POLL_INTERVAL_MS);
  }, [clearPaymentPolling, loadSubscriptions, toast]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => () => {
    clearPaymentPolling();
  }, [clearPaymentPolling]);

  useEffect(() => {
    const paymentStatus = new URLSearchParams(window.location.search).get('payment');
    const returnSubscriptionId = new URLSearchParams(window.location.search).get('subscriptionId');

    if (paymentStatus !== 'success' || !returnSubscriptionId) {
      return;
    }

    const handledKey = `${paymentStatus}:${returnSubscriptionId}`;
    if (handledReturnRef.current === handledKey) {
      return;
    }

    handledReturnRef.current = handledKey;
    clearPaymentPolling();
    pollingDeadlineRef.current = Date.now() + PAYMENT_POLL_TIMEOUT_MS;

    toast.info('Pagamento recebido. Atualizando o status da assinatura...');
    router.replace('/assinaturas');

    void (async () => {
      const latestSubscriptions = await loadSubscriptions({ silent: true });
      const currentSubscription = latestSubscriptions?.find((subscription) => subscription.id === returnSubscriptionId);

      if (currentSubscription?.status === 'active') {
        toast.success('Pagamento confirmado e assinatura ativada.');
        clearPaymentPolling();
        return;
      }

      pollingTimerRef.current = setTimeout(() => {
        void pollPaymentStatus(returnSubscriptionId);
      }, PAYMENT_POLL_INTERVAL_MS);
    })();
  }, [clearPaymentPolling, loadSubscriptions, pollPaymentStatus, router, toast]);

  const subscriptionList = subscriptions ?? [];
  const activeCount = subscriptionList.filter((subscription) => subscription.status === 'active').length;
  const attentionCount = subscriptionList.filter(
    (subscription) =>
      subscription.status === 'pending' ||
      subscription.status === 'overdue' ||
      (subscription.status === 'trialing' &&
        subscription.trialEndsAt &&
        differenceInDays(parseISO(subscription.trialEndsAt), new Date()) <= 0),
  ).length;
  const canceledCount = subscriptionList.filter((subscription) => subscription.status === 'canceled').length;
  const activeValue = subscriptionList
    .filter((subscription) => subscription.status === 'active')
    .reduce((sum, subscription) => sum + subscription.value, 0);

  async function handlePay(id: string) {
    setPayingId(id);
    try {
      const res = await subscriptionService.getPaymentLink(id);
      const { invoiceUrl, status } = res.data;

      if (invoiceUrl) {
        window.location.assign(invoiceUrl);
        return;
      }

      if (status === 'no_pending_payment') {
        toast.success('Nenhum pagamento pendente para esta assinatura.');
        return;
      }

      toast.error('Link de pagamento nao disponivel.');
    } catch {
      toast.error('Erro ao buscar link de pagamento.');
    } finally {
      setPayingId(null);
    }
  }

  async function handleCancelSubscription() {
    if (!subscriptionToCancel) return;

    setCancelingId(subscriptionToCancel.id);
    try {
      await subscriptionService.cancel(subscriptionToCancel.id);
      toast.success('Assinatura cancelada com sucesso!');
      setSubscriptionToCancel(null);
      await loadSubscriptions({ silent: true });
    } catch {
      toast.error('Erro ao cancelar assinatura.');
    } finally {
      setCancelingId(null);
    }
  }

  async function handleActivate(id: string) {
    try {
      setActivatingId(id);
      await subscriptionService.activate(id);
      const { data } = await subscriptionService.getPaymentLink(id);
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
      }
      await loadSubscriptions({ silent: true });
    } catch {
      toast.error('Erro ao ativar assinatura');
    } finally {
      setActivatingId(null);
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
        <Button variant="outline" onClick={() => void loadSubscriptions()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-muted-foreground">Acompanhe o status de cobranca das suas embarcacoes.</p>
          {isRefreshing && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando status da assinatura...
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push('/embarcacoes')}>
          <Ship className="h-4 w-4" />
          Ver embarcacoes
        </Button>
      </div>

      {subscriptionList.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={CreditCard}
              title="Nenhuma assinatura encontrada"
              description="As assinaturas aparecem aqui assim que uma embarcacao for criada para voce."
              actionLabel="Criar embarcacao"
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
              subtitle="em cobranca normal"
              icon={Wallet}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Exigem atencao"
              value={String(attentionCount)}
              subtitle="pendentes ou atrasadas"
              icon={AlertCircle}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Canceladas"
              value={String(canceledCount)}
              subtitle="mantidas no historico"
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
              const boatName = subscription.boatName || `Embarcacao ${subscription.boatId.slice(0, 8)}`;
              const isCanceling = cancelingId === subscription.id;
              const trialDaysLeft = subscription.trialEndsAt
                ? differenceInDays(parseISO(subscription.trialEndsAt), new Date())
                : 0;
              const isTrialExpired = trialDaysLeft <= 0;

              return (
                <Card key={subscription.id} className="border-border/60">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{boatName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{planName}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.label}
                      </div>
                      {subscription.status === 'trialing' && subscription.trialEndsAt && (
                        <div className="text-xs mt-1">
                          {trialDaysLeft > 0
                            ? `${trialDaysLeft} dias restantes de trial`
                            : 'Trial expirado'
                          }
                        </div>
                      )}
                      {subscription.status === 'trialing' && isTrialExpired && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-500/15 text-red-400 border-red-500/30 mt-1">
                          Trial expirado
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valor</p>
                        <p className="mt-2 text-lg font-bold text-foreground">{formatCurrency(subscription.value)}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proximo vencimento</p>
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {subscription.nextDueDate ? formatDate(subscription.nextDueDate) : '-'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cobranca</p>
                        <p className="mt-2 text-lg font-bold text-foreground">{subscription.billingType === 'UNDEFINED' ? 'A definir' : subscription.billingType}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Criada em {formatDate(subscription.createdAt)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {subscription.status === 'trialing' && (
                          <Button
                            size="sm"
                            onClick={() => handleActivate(subscription.id)}
                            disabled={activatingId === subscription.id}
                            isLoading={activatingId === subscription.id}
                          >
                            {activatingId === subscription.id ? 'Ativando...' : 'Assinar agora'}
                          </Button>
                        )}
                        {(subscription.status === 'pending' || subscription.status === 'overdue') && (
                          <Button
                            onClick={() => handlePay(subscription.id)}
                            disabled={payingId === subscription.id}
                            isLoading={payingId === subscription.id}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        {canWrite && (
                          <Button
                            variant={status.cancelable ? 'destructive' : 'outline'}
                            onClick={() => setSubscriptionToCancel(subscription)}
                            disabled={!status.cancelable || isCanceling}
                            isLoading={isCanceling}
                          >
                            {status.cancelable ? 'Cancelar assinatura' : 'Assinatura cancelada'}
                          </Button>
                        )}
                      </div>
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
            ? `Voce esta prestes a cancelar a assinatura de ${subscriptionToCancel.boatName || 'esta embarcacao'}.`
            : undefined
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
            O cancelamento mantem a assinatura no historico, mas encerra novas cobrancas para essa embarcacao.
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
