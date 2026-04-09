'use client';

import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/services';
import type { AdminAuditLog } from '@/types';
import { AdminSectionHeader } from '@/components/admin/AdminPrimitives';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';

type AuditRow = AdminAuditLog & { searchText: string } & Record<string, unknown>;

export default function AdminAuditoriaPage() {
  const { data, loading, error } = useApi(() => adminService.listAuditLogs(100));
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const rows: AuditRow[] = (data ?? []).map((log) => ({
    ...log,
    searchText: `${log.action} ${log.resourceType} ${log.resourceId} ${log.targetUserId || ''}`.toLowerCase(),
  }));

  function toggleExpanded(id: string) {
    setExpandedRows((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  const columns: Column<AuditRow>[] = [
    {
      key: 'action',
      header: 'Acao',
      render: (row) => <Badge variant="outline">{row.action}</Badge>,
      sortable: true,
      sortValue: (row) => row.action,
    },
    {
      key: 'resourceType',
      header: 'Recurso',
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.resourceType}</p>
          <p className="text-xs text-muted-foreground">{row.resourceId}</p>
        </div>
      ),
    },
    {
      key: 'targetUserId',
      header: 'Alvo',
      render: (row) => <span className="text-sm">{row.targetUserId || 'n/a'}</span>,
    },
    {
      key: 'metadata',
      header: 'Payload',
      render: (row) => (
        <pre className="max-w-[420px] overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
          {JSON.stringify(row.metadata, null, 2)}
        </pre>
      ),
    },
    {
      key: 'createdAt',
      header: 'Momento',
      render: (row) => <span className="text-sm">{formatDateTime(row.createdAt)}</span>,
      sortable: true,
      sortValue: (row) => row.createdAt,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        eyebrow="Audit Trail"
        title="Trilha imutavel das mutacoes administrativas"
        description="Toda acao sensivel no painel global fica registrada com recurso, alvo e metadata operacional."
      />

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-200">{error}</div>}

      <Card className="border-white/8 bg-white/4 before:hidden">
        <CardContent className="p-5">
          {loading ? (
            <p className="text-sm text-slate-400">Carregando auditoria...</p>
          ) : (
            <DataTable<AuditRow>
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              searchableFields={['searchText']}
              emptyTitle="Nenhum evento de auditoria"
              emptyDescription="Assim que houver acoes administrativas elas aparecerao aqui."
              emptyIcon={ScrollText}
              pageSize={20}
              renderMobileCard={(row) => {
                const expanded = Boolean(expandedRows[row.id]);
                const metadata = JSON.stringify(row.metadata, null, 2);
                const preview = metadata.length > 180 ? `${metadata.slice(0, 180)}...` : metadata;

                return (
                  <div className="rounded-2xl border border-white/6 bg-slate-950/55 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant="outline">{row.action}</Badge>
                      <span className="text-xs text-slate-500">{formatDateTime(row.createdAt)}</span>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Recurso</p>
                      <p className="mt-1 text-sm text-white">{row.resourceType}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">{row.resourceId}</p>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Alvo</p>
                      <p className="mt-1 break-all text-sm text-white">{row.targetUserId || 'n/a'}</p>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/6 bg-slate-900/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Payload</p>
                        <Button size="sm" variant="ghost" className="h-auto px-0 text-xs text-cyan-200 hover:bg-transparent" onClick={() => toggleExpanded(row.id)}>
                          {expanded ? 'Recolher' : 'Expandir'}
                        </Button>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-300">
                        {expanded ? metadata : preview}
                      </pre>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
