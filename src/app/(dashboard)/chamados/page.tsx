'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Ship,
  Calendar,
  DollarSign,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Incident } from '@/types';

const mockIncidents: Incident[] = [
  {
    id: '1',
    boatId: '1',
    boatName: 'Mar Azul',
    tripId: '2',
    description: 'Arranhão na lateral direita do casco durante atracação',
    estimatedCost: 800,
    photos: ['/mock/damage1.jpg', '/mock/damage2.jpg'],
    status: 'pendente',
    createdBy: '3',
    createdByUser: { id: '3', name: 'Carlos Marinheiro', email: '', createdAt: '' },
    createdAt: '2026-02-25',
  },
  {
    id: '2',
    boatId: '1',
    boatName: 'Mar Azul',
    tripId: '5',
    description: 'Banco do cockpit rasgado',
    estimatedCost: 1200,
    photos: [],
    status: 'aprovado',
    expenseMode: 'rateado',
    createdBy: '3',
    createdByUser: { id: '3', name: 'Carlos Marinheiro', email: '', createdAt: '' },
    createdAt: '2026-02-10',
  },
  {
    id: '3',
    boatId: '2',
    boatName: 'Veleiro Sol',
    tripId: '8',
    description: 'Vela rasgada durante temporal',
    estimatedCost: 3500,
    photos: [],
    status: 'pago',
    expenseMode: 'rateado',
    generatedExpenseId: '10',
    createdBy: '6',
    createdByUser: { id: '6', name: 'Pedro Navegador', email: '', createdAt: '' },
    createdAt: '2026-01-18',
  },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string; dotColor: string }> = {
  pendente: { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pendente', dotColor: 'bg-amber-500' },
  aprovado: { color: 'bg-blue-50 text-blue-700', icon: CheckCircle, label: 'Aprovado', dotColor: 'bg-blue-500' },
  pago: { color: 'bg-emerald-50 text-emerald-700', icon: CreditCard, label: 'Pago', dotColor: 'bg-emerald-500' },
};

export default function ChamadosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = mockIncidents.filter((i) => {
    const matchesSearch =
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.boatName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockIncidents.filter((i) => i.status === 'pendente').length;
  const totalEstimated = mockIncidents
    .filter((i) => i.status !== 'pago')
    .reduce((sum, i) => sum + i.estimatedCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chamados</h1>
          <p className="text-muted-foreground">Registro de danos e ocorrências nas embarcações</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {pendingCount} chamado{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''} de aprovação
            </p>
            <p className="text-sm text-amber-600">
              Custo estimado total: {formatCurrency(totalEstimated)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar chamado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="pago">Pago</option>
        </select>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((incident) => {
            const config = statusConfig[incident.status];
            const StatusIcon = config.icon;

            return (
              <Card key={incident.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                          incident.status === 'pendente'
                            ? 'bg-amber-50'
                            : incident.status === 'aprovado'
                            ? 'bg-blue-50'
                            : 'bg-emerald-50'
                        }`}
                      >
                        <AlertTriangle
                          className={`h-6 w-6 ${
                            incident.status === 'pendente'
                              ? 'text-amber-600'
                              : incident.status === 'aprovado'
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground">{incident.description}</h3>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Ship className="h-3.5 w-3.5" />
                            {incident.boatName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(incident.createdAt)}
                          </span>
                          {incident.createdByUser && (
                            <span className="text-xs">
                              Aberto por {incident.createdByUser.name}
                            </span>
                          )}
                        </div>
                        {incident.photos.length > 0 && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Camera className="h-3.5 w-3.5" />
                            {incident.photos.length} foto{incident.photos.length > 1 ? 's' : ''} anexada{incident.photos.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {incident.expenseMode && (
                          <Badge variant={incident.expenseMode === 'exclusivo' ? 'warning' : 'secondary'}>
                            {incident.expenseMode === 'exclusivo' ? 'Custo Exclusivo' : 'Custo Rateado'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(incident.estimatedCost)}
                      </p>
                      <p className="text-xs text-muted-foreground">custo estimado</p>
                      {incident.status === 'pendente' && (
                        <div className="mt-2 space-y-1">
                          <Button size="sm" className="w-full">
                            Aprovar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhum chamado encontrado"
          description="Não há chamados registrados com os filtros aplicados."
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Novo Chamado"
        description="Registre um dano ou ocorrência identificada"
      >
        <form className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Saída Relacionada</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="2">25/02/2026 - Ricardo Mendes</option>
              <option value="1">27/02/2026 - Gabriel Silva (em andamento)</option>
            </select>
          </div>
          <Textarea
            label="Descrição do dano/ocorrência"
            placeholder="Descreva o que aconteceu em detalhes..."
            required
          />
          <Input
            label="Custo Estimado (R$)"
            type="number"
            placeholder="0,00"
            step="0.01"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Fotos</label>
            <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Clique ou arraste fotos aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Abrir Chamado</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
