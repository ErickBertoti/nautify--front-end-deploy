'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, ShieldBan, ShieldCheck, Users } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services';
import type { AdminAccountSummary } from '@/types';
import { AdminRoleBadge, AdminSectionHeader, AccountStatusBadge, SubscriptionStatusBadge } from '@/components/admin/AdminPrimitives';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';

type AccountRow = AdminAccountSummary & { searchText: string } & Record<string, unknown>;

export default function AdminClientesPage() {
  const { data, loading, error, refetch } = useApi(() => adminService.listAccounts());
  const [selected, setSelected] = useState<AdminAccountSummary | null>(null);
  const [nextStatus, setNextStatus] = useState<'active' | 'suspended'>('suspended');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleStatusUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      await adminService.updateAccountStatus(selected.user.id, { status: nextStatus, reason });
      setSelected(null);
      setReason('');
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao atualizar status.');
    } finally {
      setSaving(false);
    }
  }

  const rows: AccountRow[] = (data ?? []).map((account) => ({
    ...account,
    searchText: `${account.user.name} ${account.user.email}`.toLowerCase(),
  }));

  const columns: Column<AccountRow>[] = [
    {
      key: 'user',
      header: 'Cliente',
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.user.name,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AccountStatusBadge status={row.user.accountStatus} />,
      sortable: true,
      sortValue: (row) => row.user.accountStatus,
    },
    {
      key: 'role',
      header: 'Perfil',
      render: (row) => <AdminRoleBadge isPlatformAdmin={row.user.isPlatformAdmin} />,
    },
    {
      key: 'boats',
      header: 'Base nautica',
      render: (row) => (
        <div className="text-sm">
          <p>{row.boatsAsMember} vinculos</p>
          <p className="text-xs text-muted-foreground">{row.boatsOwned} admins de embarcacao</p>
        </div>
      ),
      sortable: true,
      sortValue: (row) => row.boatsAsMember,
    },
    {
      key: 'subscription',
      header: 'Assinatura',
      render: (row) => (
        row.latestSubscription ? (
          <div className="space-y-1">
            <SubscriptionStatusBadge status={row.latestSubscription.status} />
            <p className="text-xs text-muted-foreground">{formatCurrency(row.latestSubscription.value)}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sem assinatura</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acoes',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/clientes/${row.user.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-3.5 w-3.5" /> Detalhe
            </Button>
          </Link>
          <Button
            size="sm"
            variant={row.user.accountStatus === 'active' ? 'destructive' : 'secondary'}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(row);
              setNextStatus(row.user.accountStatus === 'active' ? 'suspended' : 'active');
            }}
          >
            {row.user.accountStatus === 'active' ? <ShieldBan className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {row.user.accountStatus === 'active' ? 'Suspender' : 'Reativar'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Accounts"
        title="Clientes e acesso global"
        description="Visao de contas, vinculos com embarcacoes, assinatura mais recente e estado operacional do usuario."
      />

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">{error}</div>}

      <Card className="border-white/8 bg-white/4 before:hidden">
        <CardContent className="p-5">
          {loading ? (
            <p className="text-sm text-slate-400">Carregando clientes...</p>
          ) : (
            <DataTable<AccountRow>
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.user.id}
              searchableFields={['searchText']}
              emptyTitle="Nenhum cliente encontrado"
              emptyDescription="Quando houver contas cadastradas elas aparecerao aqui."
              emptyIcon={Users}
              renderMobileCard={(row) => (
                <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{row.user.name}</p>
                      <p className="break-all text-xs text-slate-400">{row.user.email}</p>
                    </div>
                    <AccountStatusBadge status={row.user.accountStatus} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminRoleBadge isPlatformAdmin={row.user.isPlatformAdmin} />
                    {row.latestSubscription && <SubscriptionStatusBadge status={row.latestSubscription.status} />}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Vinculos: {row.boatsAsMember} | Admin de embarcacao: {row.boatsOwned}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link href={`/admin/clientes/${row.user.id}`} className="w-full">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-3.5 w-3.5" /> Detalhe
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={row.user.accountStatus === 'active' ? 'destructive' : 'secondary'}
                      className="w-full"
                      onClick={() => {
                        setSelected(row);
                        setNextStatus(row.user.accountStatus === 'active' ? 'suspended' : 'active');
                      }}
                    >
                      {row.user.accountStatus === 'active' ? 'Suspender' : 'Reativar'}
                    </Button>
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setReason('');
        }}
        title={nextStatus === 'suspended' ? 'Suspender conta' : 'Reativar conta'}
        description={selected ? `Usuario alvo: ${selected.user.name}` : undefined}
        footer={(
          <div className="grid grid-cols-1 gap-2 sm:flex sm:justify-end">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setSelected(null)}>
              Fechar
            </Button>
            <Button
              variant={nextStatus === 'suspended' ? 'destructive' : 'secondary'}
              className="w-full sm:w-auto"
              isLoading={saving}
              onClick={handleStatusUpdate}
            >
              Confirmar
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <Select
            label="Novo status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as 'active' | 'suspended')}
            options={[
              { value: 'suspended', label: 'Suspensa' },
              { value: 'active', label: 'Ativa' },
            ]}
          />
          <Textarea
            label="Motivo"
            placeholder="Contexto operacional para a trilha de auditoria"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {selected && (
            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p>Conta criada em {formatDate(selected.user.createdAt)}</p>
              <p className="mt-1">Ultima assinatura: {selected.latestSubscription ? formatCurrency(selected.latestSubscription.value) : 'sem registro'}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
