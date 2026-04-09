'use client';

import { Anchor, BadgeDollarSign, ShipWheel, Tags, TriangleAlert, Users } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services';
import { AdminMetricCard, AdminSectionHeader } from '@/components/admin/AdminPrimitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminOverviewPage() {
  const { data, loading, error } = useApi(() => adminService.getOverview());
  const recentAuditLogs = data?.recentAuditLogs ?? [];

  if (loading) {
    return <div className="rounded-3xl border border-white/8 bg-white/4 p-10 text-sm text-slate-400">Carregando overview...</div>;
  }

  if (error || !data) {
    return <div className="rounded-3xl border border-rose-500/20 bg-rose-500/8 p-10 text-sm text-rose-200">{error || 'Falha ao carregar overview.'}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Platform Health"
        title="Visao operacional da plataforma"
        description="Resumo consolidado de contas, base ativa, inadimplencia e movimentacoes administrativas recentes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Usuarios totais" value={data.totalUsers} icon={Users} accent="cyan" helper={`${data.activeUsers} ativos`} />
        <AdminMetricCard label="MRR ativo" value={formatCurrency(data.mrr)} icon={BadgeDollarSign} accent="emerald" helper={`${data.activeSubscriptions} assinaturas ativas`} />
        <AdminMetricCard label="Trials em aberto" value={data.trialSubscriptions} icon={Anchor} accent="amber" helper={`${data.activePromotions} promocoes ativas`} />
        <AdminMetricCard label="Risco imediato" value={data.overdueSubscriptions} icon={TriangleAlert} accent="rose" helper={`${data.suspendedUsers} contas suspensas`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card className="border-white/8 bg-white/4 before:hidden">
          <CardHeader className="border-white/8">
            <CardTitle className="text-white">Ultimas acoes auditadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma acao administrativa registrada ainda.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/10 text-slate-200">
                      {log.action}
                    </Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{log.resourceType}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">
                    Recurso <span className="break-all font-medium">{log.resourceId}</span>
                    {log.targetUserId ? <> para o usuario <span className="break-all font-medium">{log.targetUserId}</span></> : null}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/8 bg-white/4 before:hidden">
            <CardHeader className="border-white/8">
              <CardTitle className="text-white">Base operacional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-slate-950/55 px-4 py-3">
                <span>Admins globais</span>
                <span className="font-semibold text-white">{data.platformAdmins}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-slate-950/55 px-4 py-3">
                <span>Embarcacoes cadastradas</span>
                <span className="font-semibold text-white">{data.totalBoats}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-slate-950/55 px-4 py-3">
                <span>Promocoes ativas</span>
                <span className="font-semibold text-white">{data.activePromotions}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-white/4 before:hidden">
            <CardHeader className="border-white/8">
              <CardTitle className="flex items-center gap-2 text-white">
                <ShipWheel className="h-5 w-5 text-amber-200" />
                Estado da receita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-sm text-slate-300">
              <div className="rounded-2xl border border-emerald-500/18 bg-emerald-500/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Receita ativa</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(data.mrr)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Trials</p>
                  <p className="mt-2 text-xl font-semibold text-white">{data.trialSubscriptions}</p>
                </div>
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Atrasadas</p>
                  <p className="mt-2 text-xl font-semibold text-white">{data.overdueSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-white/4 before:hidden">
            <CardHeader className="border-white/8">
              <CardTitle className="flex items-center gap-2 text-white">
                <Tags className="h-5 w-5 text-cyan-200" />
                Status da base
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Usuarios ativos</p>
                <p className="mt-2 text-xl font-semibold text-white">{data.activeUsers}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Usuarios suspensos</p>
                <p className="mt-2 text-xl font-semibold text-white">{data.suspendedUsers}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
