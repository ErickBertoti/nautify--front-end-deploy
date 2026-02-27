'use client';

import React, { useState } from 'react';
import {
  Navigation,
  Plus,
  Search,
  Ship,
  Calendar,
  Clock,
  User,
  Anchor,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Trip } from '@/types';

const mockTrips: Trip[] = [
  {
    id: '1',
    boatId: '1',
    boatName: 'Mar Azul',
    type: 'uso',
    responsibleUser: { id: '1', name: 'Gabriel Silva', email: '', createdAt: '' },
    responsibleUserId: '1',
    sailor: { id: '3', name: 'Carlos Marinheiro', email: '', createdAt: '' },
    sailorId: '3',
    startDate: '2026-02-27T14:00:00',
    status: 'em_andamento',
    observations: 'Passeio até Ilhabela',
    createdAt: '2026-02-27',
  },
  {
    id: '2',
    boatId: '1',
    boatName: 'Mar Azul',
    type: 'uso',
    responsibleUser: { id: '2', name: 'Ricardo Mendes', email: '', createdAt: '' },
    responsibleUserId: '2',
    sailor: { id: '3', name: 'Carlos Marinheiro', email: '', createdAt: '' },
    sailorId: '3',
    startDate: '2026-02-25T10:00:00',
    endDate: '2026-02-25T18:30:00',
    status: 'com_ocorrencia',
    observations: 'Saída recreativa - Identificado arranhão no casco',
    createdAt: '2026-02-25',
  },
  {
    id: '3',
    boatId: '1',
    boatName: 'Mar Azul',
    type: 'teste',
    sailor: { id: '3', name: 'Carlos Marinheiro', email: '', createdAt: '' },
    sailorId: '3',
    startDate: '2026-02-23T08:00:00',
    endDate: '2026-02-23T12:00:00',
    status: 'finalizada',
    observations: 'Teste motor após manutenção - OK',
    createdAt: '2026-02-23',
  },
  {
    id: '4',
    boatId: '2',
    boatName: 'Veleiro Sol',
    type: 'uso',
    responsibleUser: { id: '5', name: 'Ana Paula', email: '', createdAt: '' },
    responsibleUserId: '5',
    sailor: { id: '6', name: 'Pedro Navegador', email: '', createdAt: '' },
    sailorId: '6',
    startDate: '2026-02-22T09:00:00',
    endDate: '2026-02-22T17:00:00',
    status: 'finalizada',
    createdAt: '2026-02-22',
  },
];

const statusColors: Record<string, string> = {
  em_andamento: 'bg-blue-50 text-blue-700 border-blue-200',
  finalizada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  com_ocorrencia: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<string, string> = {
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  com_ocorrencia: 'Com ocorrência',
};

const statusDots: Record<string, string> = {
  em_andamento: 'bg-blue-500',
  finalizada: 'bg-emerald-500',
  com_ocorrencia: 'bg-red-500',
};

export default function SaidasPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filtered = mockTrips.filter((t) => {
    const matchesSearch =
      t.boatName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.observations?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saídas</h1>
          <p className="text-muted-foreground">Registro e acompanhamento de saídas das embarcações</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Nova Saída
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
              <p className="text-lg font-bold">
                {mockTrips.filter((t) => t.status === 'em_andamento').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Finalizadas</p>
              <p className="text-lg font-bold">
                {mockTrips.filter((t) => t.status === 'finalizada').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Com ocorrência</p>
              <p className="text-lg font-bold">
                {mockTrips.filter((t) => t.status === 'com_ocorrencia').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar saída..."
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
          <option value="em_andamento">Em andamento</option>
          <option value="finalizada">Finalizada</option>
          <option value="com_ocorrencia">Com ocorrência</option>
        </select>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                        trip.status === 'em_andamento'
                          ? 'bg-blue-50'
                          : trip.status === 'com_ocorrencia'
                          ? 'bg-red-50'
                          : 'bg-emerald-50'
                      }`}
                    >
                      <Ship
                        className={`h-6 w-6 ${
                          trip.status === 'em_andamento'
                            ? 'text-blue-600'
                            : trip.status === 'com_ocorrencia'
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{trip.boatName}</h3>
                        <Badge variant={trip.type === 'teste' ? 'outline' : 'secondary'}>
                          {trip.type === 'teste' ? 'Teste' : 'Uso'}
                        </Badge>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[trip.status]
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[trip.status]}`} />
                          {statusLabels[trip.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateTime(trip.startDate)}
                        </span>
                        {trip.endDate && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            até {formatDateTime(trip.endDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {trip.responsibleUser && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {trip.responsibleUser.name}
                          </span>
                        )}
                        {trip.sailor && (
                          <span className="flex items-center gap-1.5">
                            <Anchor className="h-3.5 w-3.5" />
                            {trip.sailor.name}
                          </span>
                        )}
                      </div>
                      {trip.observations && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          &ldquo;{trip.observations}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Navigation}
          title="Nenhuma saída encontrada"
          description="Registre a primeira saída de uma embarcação."
          actionLabel="Nova Saída"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Saída"
        description="Registre uma nova saída de embarcação"
      >
        <form className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Tipo</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="uso">Uso (Sócio)</option>
                <option value="teste">Teste (Operacional)</option>
              </select>
            </div>
            <Input label="Data/Hora Saída" type="datetime-local" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Sócio Responsável</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Selecione (obrigatório se tipo Uso)</option>
              <option value="1">Gabriel Silva</option>
              <option value="2">Ricardo Mendes</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Marinheiro</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="3">Carlos Marinheiro</option>
            </select>
          </div>
          <Textarea label="Observações" placeholder="Destino, propósito, etc. (opcional)" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar Saída</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
