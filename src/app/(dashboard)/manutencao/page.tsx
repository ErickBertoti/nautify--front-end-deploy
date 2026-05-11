'use client';

import React, { useState } from 'react';
import {
  Wrench, Plus, Search, AlertTriangle,
  CheckCircle, Clock, Calendar, DollarSign, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { MaintenanceCard } from '@/components/maintenance/MaintenanceCard';
import { MaintenanceEditModal, MaintenanceCompleteModal } from '@/components/maintenance/MaintenanceModals';
import { MaintenancePartsModal } from '@/components/maintenance/MaintenancePartsModal';
import { AttachmentUploader } from '@/components/shared/AttachmentUploader';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { maintenanceService } from '@/services';
import type { Maintenance, MaintenancePartHistory, PaginatedResponse } from '@/types';

export default function ManutencaoPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [completing, setCompleting] = useState<Maintenance | null>(null);
  const [managingParts, setManagingParts] = useState<Maintenance | null>(null);
  const [managingAttachments, setManagingAttachments] = useState<Maintenance | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'manutencoes' | 'pecas'>('manutencoes');
  const [partsBoatFilter, setPartsBoatFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const canWrite = useHasAnyBoat();
  const { boats } = useBoats();
  const toast = useToast();

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
  const totalEstimated = maintenances
    .filter((m) => m.status !== 'cancelada')
    .reduce((s, m) => s + m.estimatedCost, 0);

  const filtered = maintenances.filter((m) => {
    const term = search.toLowerCase();
    if (term && !m.title.toLowerCase().includes(term) && !m.description.toLowerCase().includes(term)) return false;
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setCreating(true);
    try {
      await maintenanceService.create({
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        type: formData.get('type') as Maintenance['type'],
        priority: formData.get('priority') as Maintenance['priority'],
        boatId: String(formData.get('boatId') || ''),
        scheduledDate: String(formData.get('scheduledDate') || ''),
        estimatedCost: Number(formData.get('estimatedCost')) || 0,
      });
      toast.success('Manutencao criada');
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar manutencao'));
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (m: Maintenance) => {
    try {
      await maintenanceService.update(m.id, { ...m, status: 'em_andamento' });
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao iniciar manutencao'));
    }
  };

  const handleCancel = async (m: Maintenance) => {
    try {
      await maintenanceService.cancel(m.id);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao cancelar manutencao'));
    }
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
          <h1 className="text-2xl font-bold">Manutencao</h1>
          <p className="text-muted-foreground">Gestao de manutencoes preventivas e corretivas</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Manutencao
          </Button>
        )}
      </div>

      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        <button
          onClick={() => setActiveTab('manutencoes')}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'manutencoes' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
        >
          Manutencoes
        </button>
        <button
          onClick={() => setActiveTab('pecas')}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'pecas' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
        >
          Pecas Trocadas
        </button>
      </div>

      {activeTab === 'manutencoes' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Pendentes"     value={String(agendadas)}      subtitle="aguardando" icon={Calendar}    iconBgColor="bg-blue-50 dark:bg-blue-500/15"     iconColor="text-blue-600 dark:text-blue-300" />
            <StatCard title="Em Andamento"  value={String(emAndamento)}    subtitle="ativas"      icon={Clock}       iconBgColor="bg-amber-50 dark:bg-amber-500/15"   iconColor="text-amber-600 dark:text-amber-300" />
            <StatCard title="Concluidas"    value={String(concluidas)}     subtitle="finalizadas" icon={CheckCircle} iconBgColor="bg-emerald-50 dark:bg-emerald-500/15" iconColor="text-emerald-600 dark:text-emerald-300" />
            <StatCard title="Custo Estimado" value={formatCurrency(totalEstimated)} subtitle="total previsto" icon={DollarSign} iconBgColor="bg-purple-50 dark:bg-purple-500/15" iconColor="text-purple-600 dark:text-purple-300" />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar manutencao..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">Todos os tipos</option>
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                </Select>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Todos os status</option>
                  <option value="agendada">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluida</option>
                  <option value="cancelada">Cancelada</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState icon={Wrench} title="Nenhuma manutencao" description="Crie uma nova manutencao para comecar." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((m) => (
                <MaintenanceCard
                  key={m.id}
                  maintenance={m}
                  canWrite={canWrite}
                  onStart={() => handleStart(m)}
                  onComplete={() => setCompleting(m)}
                  onEdit={() => setEditing(m)}
                  onCancel={() => handleCancel(m)}
                  onManageParts={() => setManagingParts(m)}
                  onManageAttachments={() => setManagingAttachments(m)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'pecas' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Select value={partsBoatFilter} onChange={(e) => setPartsBoatFilter(e.target.value)}>
              <option value="">Todas embarcacoes</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          {loadingParts ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : parts.length === 0 ? (
            <EmptyState icon={Wrench} title="Nenhuma peca registrada" description="Pecas adicionadas em manutencoes aparecerao aqui" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium">Peca</th>
                        <th className="text-left px-4 py-3 font-medium">Qtd</th>
                        <th className="text-left px-4 py-3 font-medium">Custo Unit.</th>
                        <th className="text-left px-4 py-3 font-medium">Total</th>
                        <th className="text-left px-4 py-3 font-medium">Manutencao</th>
                        <th className="text-left px-4 py-3 font-medium">Data</th>
                        <th className="text-left px-4 py-3 font-medium">Embarcacao</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3">{p.quantity}</td>
                          <td className="px-4 py-3">{formatCurrency(p.unitCost)}</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(p.totalCost)}</td>
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

      {/* Criação — sem custo real (essa info entra só na conclusão) */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nova Manutencao">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input name="title" label="Titulo" placeholder="Ex: Revisao do Motor" required />
          <Textarea name="description" label="Descricao" placeholder="Descreva a manutencao..." rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo">
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
            </Select>
            <Select name="priority" label="Prioridade">
              <option value="baixa">Baixa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="boatId" label="Embarcacao" required>
              <option value="">Selecione...</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input name="scheduledDate" label="Data Agendada" type="date" required />
          </div>
          <Input name="estimatedCost" label="Custo Estimado (R$)" type="number" step="0.01" placeholder="0,00" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={creating}>
              {creating ? 'Criando...' : 'Criar Manutencao'}
            </Button>
          </div>
        </form>
      </Modal>

      {editing && (
        <MaintenanceEditModal
          maintenance={editing}
          boats={boats}
          isOpen
          onClose={() => setEditing(null)}
          onSaved={refetch}
        />
      )}

      {completing && (
        <MaintenanceCompleteModal
          maintenance={completing}
          isOpen
          onClose={() => setCompleting(null)}
          onCompleted={refetch}
        />
      )}

      {managingParts && (
        <MaintenancePartsModal
          maintenanceId={managingParts.id}
          maintenanceTitle={managingParts.title}
          isOpen
          onClose={() => { setManagingParts(null); refetch(); }}
        />
      )}

      {managingAttachments && (
        <Modal isOpen onClose={() => setManagingAttachments(null)} title={`Anexos — ${managingAttachments.title}`}>
          <AttachmentUploader
            entityType="maintenance"
            entityId={managingAttachments.id}
            storageFolder={`maintenances/${managingAttachments.id}`}
          />
        </Modal>
      )}
    </div>
  );
}
