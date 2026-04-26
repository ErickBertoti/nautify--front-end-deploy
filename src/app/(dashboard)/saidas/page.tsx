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
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats, useBoatMembers } from '@/hooks/useEntityOptions';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { tripService } from '@/services';
import type { Trip } from '@/types';

const statusColors: Record<string, string> = {
  agendada:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  em_andamento:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  finalizada:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  com_ocorrencia:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
};

const statusLabels: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  com_ocorrencia: 'Com ocorrência',
};

const statusDots: Record<string, string> = {
  agendada: 'bg-amber-500',
  em_andamento: 'bg-blue-500',
  finalizada: 'bg-emerald-500',
  com_ocorrencia: 'bg-red-500',
};

export default function SaidasPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const canWrite = useHasAnyBoat();
  const { boats } = useBoats();
  const { socios, sailors } = useBoatMembers(selectedBoatId);

  const { data: trips, loading, error, refetch } = useApi<Trip[]>(
    () => tripService.list(),
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !trips) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar saídas'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const filtered = trips.filter((t) => {
    const matchesSearch =
      t.boatName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.observations?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStart = async (id: string) => {
    await tripService.start(id);
    refetch();
  };

  const handleFinish = async (id: string) => {
    await tripService.finish(id);
    refetch();
  };

  const handleCancel = async (id: string) => {
    await tripService.cancel(id);
    refetch();
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    await tripService.create({
      boatId: formData.get('boatId') as string,
      type: formData.get('type') as Trip['type'],
      startDate: formData.get('startDate') as string,
      responsibleUserId: (formData.get('responsibleUserId') as string) || undefined,
      sailorId: formData.get('sailorId') as string,
      observations: (formData.get('observations') as string) || undefined,
    });

    setShowAddModal(false);
    setSelectedBoatId('');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saídas</h1>
          <p className="text-muted-foreground">
            Registro e acompanhamento de saídas das embarcações
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Nova Saída
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Agendadas</p>
              <p className="text-lg font-bold">
                {trips.filter((t) => t.status === 'agendada').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
              <p className="text-lg font-bold">
                {trips.filter((t) => t.status === 'em_andamento').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Finalizadas</p>
              <p className="text-lg font-bold">
                {trips.filter((t) => t.status === 'finalizada').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Com ocorrência</p>
              <p className="text-lg font-bold">
                {trips.filter((t) => t.status === 'com_ocorrencia').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar saída..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto"
        >
          <option value="todos">Todos os status</option>
          <option value="agendada">Agendada</option>
          <option value="em_andamento">Em andamento</option>
          <option value="finalizada">Finalizada</option>
          <option value="com_ocorrencia">Com ocorrência</option>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <Card key={trip.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        trip.status === 'agendada'
                          ? 'bg-amber-50 dark:bg-amber-500/15'
                          : trip.status === 'em_andamento'
                            ? 'bg-blue-50 dark:bg-blue-500/15'
                            : trip.status === 'com_ocorrencia'
                              ? 'bg-red-50 dark:bg-red-500/15'
                              : 'bg-emerald-50 dark:bg-emerald-500/15'
                      }`}
                    >
                      <Ship
                        className={`h-6 w-6 ${
                          trip.status === 'agendada'
                            ? 'text-amber-600 dark:text-amber-300'
                            : trip.status === 'em_andamento'
                              ? 'text-blue-600 dark:text-blue-300'
                              : trip.status === 'com_ocorrencia'
                                ? 'text-red-600 dark:text-red-300'
                                : 'text-emerald-600 dark:text-emerald-300'
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
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDots[trip.status]}`} />
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
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          &ldquo;{trip.observations}&rdquo;
                        </p>
                      )}

                      {canWrite &&
                        (trip.status === 'agendada' || trip.status === 'em_andamento') && (
                          <div className="mt-2 flex gap-2">
                            {trip.status === 'agendada' && (
                              <Button size="sm" onClick={() => handleStart(trip.id)}>
                                Iniciar
                              </Button>
                            )}
                            {trip.status === 'em_andamento' && (
                              <Button size="sm" onClick={() => handleFinish(trip.id)}>
                                Finalizar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                              onClick={() => handleCancel(trip.id)}
                            >
                              Ocorrência
                            </Button>
                          </div>
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

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedBoatId('');
        }}
        title="Nova Saída"
        description="Registre uma nova saída de embarcação"
      >
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
          <Select
            name="boatId"
            label="Embarcação"
            value={selectedBoatId}
            onChange={(e) => setSelectedBoatId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {boats.map((boat) => (
              <option key={boat.id} value={boat.id}>
                {boat.name}
                {boat.model ? ` - ${boat.model}` : ''}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select name="type" label="Tipo">
              <option value="uso">Uso (Sócio)</option>
              <option value="teste">Teste (Operacional)</option>
            </Select>
            <Input label="Data/Hora Saída" name="startDate" type="datetime-local" required />
          </div>

          <Select name="responsibleUserId" label="Sócio Responsável">
            <option value="">
              {selectedBoatId ? 'Selecione...' : 'Selecione a embarcação primeiro'}
            </option>
            {socios.map((member) => (
              <option key={member.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>

          <Select name="sailorId" label="Marinheiro">
            <option value="">
              {selectedBoatId ? 'Nenhum (opcional)' : 'Selecione a embarcação primeiro'}
            </option>
            {sailors.map((member) => (
              <option key={member.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Observações"
            name="observations"
            placeholder="Destino, propósito, etc. (opcional)"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setSelectedBoatId('');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Registrar Saída</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
