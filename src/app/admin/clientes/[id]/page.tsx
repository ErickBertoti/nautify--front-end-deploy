'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Ship, UserRound } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services';
import { AdminRoleBadge, AdminSectionHeader, AccountStatusBadge, SubscriptionStatusBadge } from '@/components/admin/AdminPrimitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminClienteDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useApi(() => adminService.getAccount(params.id), [params.id]);

  if (loading) {
    return <div className="rounded-3xl border border-white/8 bg-white/4 p-8 text-sm text-slate-400">Carregando cliente...</div>;
  }

  if (error || !data) {
    return <div className="rounded-3xl border border-rose-500/20 bg-rose-500/8 p-8 text-sm text-rose-200">{error || 'Cliente nao encontrado.'}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Account Detail"
        title={data.user.name}
        description="Perfil consolidado, memberships nauticos e estado de cobranca mais recente."
        actions={
          <Link href="/admin/clientes">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/8 bg-white/4 before:hidden">
          <CardHeader className="border-white/8">
            <CardTitle className="flex items-center gap-2 text-white">
              <UserRound className="h-5 w-5 text-cyan-200" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
              <p className="mt-2 text-sm text-white">{data.user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Telefone</p>
              <p className="mt-2 text-sm text-white">{data.user.phone || 'Nao informado'}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <AccountStatusBadge status={data.user.accountStatus} />
                <AdminRoleBadge isPlatformAdmin={data.user.isPlatformAdmin} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cadastro</p>
              <p className="mt-2 text-sm text-white">{formatDate(data.user.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/4 before:hidden">
          <CardHeader className="border-white/8">
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5 text-amber-200" />
              Assinatura mais recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {data.latestSubscription ? (
              <>
                <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <div>
                    <p className="text-sm text-white">{data.latestSubscription.boatName || data.latestSubscription.boatId}</p>
                    <p className="text-xs text-slate-400">Plano {data.latestSubscription.plan?.name || data.latestSubscription.planId}</p>
                  </div>
                  <SubscriptionStatusBadge status={data.latestSubscription.status} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Valor</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(data.latestSubscription.value)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Criada em</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formatDate(data.latestSubscription.createdAt)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Nenhuma assinatura associada a este usuario.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/4 before:hidden">
        <CardHeader className="border-white/8">
            <CardTitle className="flex items-center gap-2 text-white">
            <Ship className="h-5 w-5 text-emerald-200" />
            Memberships nauticos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {data.user.memberships && data.user.memberships.length > 0 ? (
            data.user.memberships.map((membership) => (
              <div key={membership.boatId} className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                <p className="font-medium text-white">{membership.boatName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{membership.role}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Este usuario nao possui memberships ativos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
