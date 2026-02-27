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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockMaintenances = [
  { id: '1', boatName: 'Mar Azul', title: 'Revisão do Motor 200h', description: 'Troca de óleo, filtros e verificação geral do motor', type: 'preventiva', status: 'agendada', priority: 'alta', scheduledDate: '2026-03-10', estimatedCost: 2500, parts: [{ name: 'Óleo Motor', qty: 4, cost: 120 }, { name: 'Filtro de óleo', qty: 1, cost: 85 }] },
  { id: '2', boatName: 'Veleiro Sol', title: 'Revisão Elétrica', description: 'Verificação do sistema elétrico completo', type: 'preventiva', status: 'agendada', priority: 'media', scheduledDate: '2026-03-20', estimatedCost: 800, parts: [] },
  { id: '3', boatName: 'Mar Azul', title: 'Reparo no Casco', description: 'Arranhão lateral precisa de reparo e pintura', type: 'corretiva', status: 'em_andamento', priority: 'alta', scheduledDate: '2026-03-05', estimatedCost: 1200, parts: [{ name: 'Resina Epóxi', qty: 2, cost: 180 }, { name: 'Tinta náutica', qty: 1, cost: 350 }] },
  { id: '4', boatName: 'Mar Azul', title: 'Troca da Hélice', description: 'Hélice com desgaste excessivo', type: 'corretiva', status: 'concluida', priority: 'urgente', scheduledDate: '2026-02-25', estimatedCost: 3500, actualCost: 3200, parts: [{ name: 'Hélice inox', qty: 1, cost: 2800 }] },
  { id: '5', boatName: 'Veleiro Sol', title: 'Polimento e Enceramento', description: 'Manutenção estética preventiva', type: 'preventiva', status: 'concluida', priority: 'baixa', scheduledDate: '2026-02-20', estimatedCost: 500, actualCost: 480, parts: [] },
  { id: '6', boatName: 'Mar Azul', title: 'Inspeção de Segurança', description: 'Verificação de coletes, extintores e sinalizadores', type: 'preventiva', status: 'cancelada', priority: 'media', scheduledDate: '2026-02-15', estimatedCost: 300, parts: [] },
];

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

export default function ManutencaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const agendadas = mockMaintenances.filter((m) => m.status === 'agendada').length;
  const emAndamento = mockMaintenances.filter((m) => m.status === 'em_andamento').length;
  const concluidas = mockMaintenances.filter((m) => m.status === 'concluida').length;
  const totalEstimated = mockMaintenances.filter((m) => m.status !== 'cancelada').reduce((s, m) => s + m.estimatedCost, 0);

  const filtered = mockMaintenances.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manutenção</h1>
          <p className="text-muted-foreground">Gestão de manutenções preventivas e corretivas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Manutenção
        </Button>
      </div>

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
          const status = statusConfig[maintenance.status];
          const priority = priorityConfig[maintenance.priority];
          const StatusIcon = status.icon;
          return (
            <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${maintenance.type === 'preventiva' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                      <Wrench className={`h-5 w-5 ${maintenance.type === 'preventiva' ? 'text-blue-600' : 'text-amber-600'}`} />
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
                  <Badge variant={maintenance.type === 'preventiva' ? 'default' : 'outline'}>
                    {maintenance.type === 'preventiva' ? 'Preventiva' : 'Corretiva'}
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
                          {part.name} (x{part.qty}) - {formatCurrency(part.cost)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(maintenance.status === 'agendada' || maintenance.status === 'em_andamento') && (
                  <div className="flex gap-2 mt-4">
                    {maintenance.status === 'agendada' && <Button variant="outline" size="sm" className="flex-1">Iniciar</Button>}
                    {maintenance.status === 'em_andamento' && <Button size="sm" className="flex-1">Concluir</Button>}
                    <Button variant="ghost" size="sm">Cancelar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Manutenção">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input label="Título" placeholder="Ex: Revisão do Motor" required />
          <Textarea label="Descrição" placeholder="Descreva a manutenção..." rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Tipo">
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
            </Select>
            <Select label="Prioridade">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Embarcação">
              <option value="1">Mar Azul</option>
              <option value="2">Veleiro Sol</option>
            </Select>
            <Input label="Data Agendada" type="date" required />
          </div>
          <Input label="Custo Estimado (R$)" type="number" placeholder="0,00" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Criar Manutenção</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
