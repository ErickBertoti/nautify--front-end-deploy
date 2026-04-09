'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ship,
  Calendar,
  DollarSign,
  Package,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { useCanWrite } from '@/hooks/useCanWrite';
import { maintenanceService } from '@/services';
import type { Maintenance, MaintenancePartHistory, PaginatedResponse } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  agendada: { label: 'Agendada', color: 'bg-blue-50 text-blue-700', icon: Calendar },
  em_andamento: { label: 'Em andamento', color: 'bg-amber-50 text-amber-700', icon: Clock },
  concluida: { label: 'Concluída', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: 'bg-red-50 text-red-700', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  media: { label: 'Média', color: 'bg-blue-50 text-blue-700' },
  alta: { label: 'Alta', color: 'bg-amber-50 text-amber-700' },
  urgente: { label: 'Urgente', color: 'bg-red-50 text-red-700' },
};

const fallbackStatus = {
  label: 'Sem status',
  color: 'bg-gray-100 text-gray-700',
  icon: AlertTriangle,
};

const fallbackPriority = {
  label: 'Sem prioridade',
  color: 'bg-gray-100 text-gray-700',
};

function formatDisplayLabel(value: string) {
  const normalized = value.replace(/_/g, ' ').trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '';
}

function getStatusDisplay(status?: string) {
  if (!status) return fallbackStatus;
  return statusConfig[status] ?? { ...fallbackStatus, label: formatDisplayLabel(status) };
}

function getPriorityDisplay(priority?: string) {
  if (!priority) return fallbackPriority;
  return priorityConfig[priority] ?? { ...fallbackPriority, label: formatDisplayLabel(priority) };
}

export default function ManutencaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'manutencoes' | 'pecas'>('manutencoes');
  const [partsBoatFilter, setPartsBoatFilter] = useState('');
  const canWrite = useCanWrite();
  const { boats } = useBoats();

  const { data: paginatedData, loading, error, refetch } = useApi(
    () => maintenanceService.list(),
    [],
  );

  const maintenances: Maintenance[] = paginatedData ?? [];

  const { data: partsData, loading: loadingParts } = useApi(
    () => maintenanceService.listParts({ boatId: partsBoatFilter || undefined }),
    [partsBoatFilter, activeTab],
  );
  const partsResponse = partsData as PaginatedResponse<MaintenancePartHistory> | null;
  const parts: MaintenancePartHistory[] = partsResponse?.data ?? [];

  const agendadas = maintenances.filter((m) => m.status === 'agendada').length;
  const emAndamento = maintenances.filter((m) => m.status === 'em_andamento').length;
  const concluidas = maintenances.filter((m) => m.status === 'concluida').length;
  const totalEstimated = maintenances.filter((m) => m.status !== 'cancelada').reduce((s, m) => s + m.estimatedCost, 0);

  const filtered = maintenances.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await maintenanceService.create({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as Maintenance['type'],
      priority: formData.get('priority') as Maintenance['priority'],
      boatId: formData.get('boatId') as string,
      scheduledDate: formData.get('scheduledDate') as string,
      estimatedCost: Number(formData.get('estimatedCost')) || 0,
    });
    setIsModalOpen(false);
    refetch();
  };

  const handleStart = async (maintenance: Maintenance) => {
    await maintenanceService.update(maintenance.id, { ...maintenance, status: 'em_andamento' });
    refetch();
  };

  const handleComplete = async (id: string) => {
    await maintenanceService.complete(id, {});
    refetch();
  };

  const handleDelete = async (id: string) => {
    await maintenanceService.delete(id);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manutenção</h1>
          <p className="text-muted-foreground">Gestão de manutenções preventivas e corretivas</p>
        </div>
        {canWrite && <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Manutenção
        </Button>}
      </div>

      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button onClick={() => setActiveTab('manutencoes')} className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'manutencoes' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}>Manutenções</button>
        <button onClick={() => setActiveTab('pecas')} className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'pecas' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}>Peças Trocadas</button>
      </div>

      {activeTab === 'manutencoes' && (<>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Agendadas" value={String(agendadas)} subtitle="futuras" icon={Calendar} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Em Andamento" value={String(emAndamento)} subtitle="ativas agora" icon={Clock} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Concluídas" value={String(concluidas)} subtitle="finalizadas" icon={CheckCircle} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Custo Estimado" value={formatCurrency(totalEstimated)} subtitle="total previsto" icon={DollarSign} iconBgColor="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar manutenção..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="agendada">Agendada</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((maintenance) => {
          const status = getStatusDisplay(maintenance.status);
          const priority = getPriorityDisplay(maintenance.priority);
          const StatusIcon = status.icon;
          const isPreventiva = maintenance.type === 'preventiva';
          const isCorretiva = maintenance.type === 'corretiva';
          const typeLabel = isPreventiva ? 'Preventiva' : isCorretiva ? 'Corretiva' : 'Não informado';
          const typeBadgeVariant = isPreventiva ? 'default' : 'outline';
          const typeIconBg = isPreventiva ? 'bg-blue-50' : isCorretiva ? 'bg-amber-50' : 'bg-gray-100';
          const typeIconColor = isPreventiva ? 'text-blue-600' : isCorretiva ? 'text-amber-600' : 'text-gray-600';
          return (
            <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${typeIconBg}`}>
                      <Wrench className={`h-5 w-5 ${typeIconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{maintenance.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{maintenance.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${status.color}`}>
                    <StatusIcon className="h-3 w-3" /> {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">
                    <Ship className="h-3 w-3 mr-1" /> {maintenance.boatName}
                  </Badge>
                  <Badge variant={typeBadgeVariant}>
                    {typeLabel}
                  </Badge>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Agendada para</p>
                    <p className="text-sm font-medium">{formatDate(maintenance.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Custo Estimado</p>
                    <p className="text-sm font-medium">{formatCurrency(maintenance.estimatedCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Custo Real</p>
                    <p className="text-sm font-medium">{maintenance.actualCost ? formatCurrency(maintenance.actualCost) : '—'}</p>
                  </div>
                </div>

                {maintenance.parts.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Peças ({maintenance.parts.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {maintenance.parts.map((part, i) => (
                        <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                          {part.name} (x{part.quantity}) - {formatCurrency(part.unitCost)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {canWrite && (maintenance.status === 'agendada' || maintenance.status === 'em_andamento') && (
                  <div className="flex gap-2 mt-4">
                    {maintenance.status === 'agendada' && <Button variant="outline" size="sm" className="flex-1" onClick={() => handleStart(maintenance)}>Iniciar</Button>}
                    {maintenance.status === 'em_andamento' && <Button size="sm" className="flex-1" onClick={() => handleComplete(maintenance.id)}>Concluir</Button>}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(maintenance.id)}>Cancelar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </>)}

      {activeTab === 'pecas' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Select value={partsBoatFilter} onChange={(e) => setPartsBoatFilter(e.target.value)}>
              <option value="">Todas embarcações</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          {loadingParts ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : parts.length === 0 ? (
            <EmptyState icon={Wrench} title="Nenhuma peça registrada" description="Peças adicionadas em manutenções aparecerão aqui" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium">Peça</th>
                        <th className="text-left px-4 py-3 font-medium">Qtd</th>
                        <th className="text-left px-4 py-3 font-medium">Custo Unit.</th>
                        <th className="text-left px-4 py-3 font-medium">Total</th>
                        <th className="text-left px-4 py-3 font-medium">Manutenção</th>
                        <th className="text-left px-4 py-3 font-medium">Data</th>
                        <th className="text-left px-4 py-3 font-medium">Embarcação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3">{p.quantity}</td>
                          <td className="px-4 py-3">R$ {p.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-3 font-medium">R$ {p.totalCost.toFixed(2)}</td>
                          <td className="px-4 py-3">{p.maintenanceTitle}</td>
                          <td className="px-4 py-3">{new Date(p.scheduledDate).toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3">{p.boatName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Manutenção">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input name="title" label="Título" placeholder="Ex: Revisão do Motor" required />
          <Textarea name="description" label="Descrição" placeholder="Descreva a manutenção..." rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo">
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
            </Select>
            <Select name="priority" label="Prioridade">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="boatId" label="Embarcação">
              <option value="">Selecione...</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input name="scheduledDate" label="Data Agendada" type="date" required />
          </div>
          <Input name="estimatedCost" label="Custo Estimado (R$)" type="number" placeholder="0,00" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Criar Manutenção</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
