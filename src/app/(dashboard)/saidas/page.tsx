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
  Pencil,
  Ban,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
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
  cancelada:
    'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  com_ocorrencia: 'Com ocorrencia',
  cancelada: 'Cancelada',
};

const statusDots: Record<string, string> = {
  agendada: 'bg-amber-500',
  em_andamento: 'bg-blue-500',
  finalizada: 'bg-emerald-500',
  com_ocorrencia: 'bg-red-500',
  cancelada: 'bg-gray-500',
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  return value.slice(0, 16);
};

export default function SaidasPage() {
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [occurrenceTrip, setOccurrenceTrip] = useState<Trip | null>(null);
  const [cancelTrip, setCancelTrip] = useState<Trip | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const canWrite = useHasAnyBoat();
  const toast = useToast();
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
        <p className="text-muted-foreground">{error || 'Erro ao carregar saidas'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const filtered = trips.filter((trip) => {
    const query = searchQuery.toLowerCase();
    const occurrence = trip.occurrence || trip.occurrenceDescription || (trip.status === 'com_ocorrencia' ? trip.observations : '');
    const matchesSearch =
      trip.boatName?.toLowerCase().includes(query) ||
      trip.observations?.toLowerCase().includes(query) ||
      occurrence?.toLowerCase().includes(query);
    const matchesStatus = filterStatus === 'todos' || trip.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingTrip(null);
    setSelectedBoatId('');
    setShowTripModal(true);
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setSelectedBoatId(trip.boatId);
    setShowTripModal(true);
  };

  const closeTripModal = () => {
    setShowTripModal(false);
    setEditingTrip(null);
    setSelectedBoatId('');
  };

  const payloadFromForm = (form: HTMLFormElement): Partial<Trip> => {
    const formData = new FormData(form);
    return {
      boatId: formData.get('boatId') as string,
      type: formData.get('type') as Trip['type'],
      startDate: formData.get('startDate') as string,
      responsibleUserId: (formData.get('responsibleUserId') as string) || undefined,
      sailorId: (formData.get('sailorId') as string) || undefined,
      observations: (formData.get('observations') as string) || undefined,
    };
  };

  const handleSaveTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = payloadFromForm(e.currentTarget);
      if (editingTrip) {
        await tripService.update(editingTrip.id, payload);
        toast.success('Saida atualizada');
      } else {
        await tripService.create(payload);
        toast.success('Saida registrada');
      }
      closeTripModal();
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, editingTrip ? 'Erro ao editar saida' : 'Erro ao registrar saida'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      setActionId(id);
      await tripService.start(id);
      await refetch();
      toast.success('Saida iniciada');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao iniciar saida'));
    } finally {
      setActionId(null);
    }
  };

  const handleFinish = async (id: string) => {
    try {
      setActionId(id);
      await tripService.finish(id);
      await refetch();
      toast.success('Saida finalizada');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao finalizar saida'));
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setSubmitting(true);
      await tripService.cancel(id);
      setCancelTrip(null);
      await refetch();
      toast.success('Saida cancelada');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao cancelar saida'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterOccurrence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!occurrenceTrip) return;
    const formData = new FormData(e.currentTarget);
    const occurrence = (formData.get('occurrence') as string).trim();
    if (!occurrence) {
      toast.warning('Informe o texto da ocorrencia');
      return;
    }

    try {
      setSubmitting(true);
      await tripService.registerOccurrence(occurrenceTrip.id, occurrence);
      setOccurrenceTrip(null);
      await refetch();
      toast.success('Ocorrencia registrada');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao registrar ocorrencia'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saidas</h1>
          <p className="text-muted-foreground">
            Registro e acompanhamento de saidas das embarcacoes
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nova Saida
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
                {trips.filter((trip) => trip.status === 'agendada').length}
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
                {trips.filter((trip) => trip.status === 'em_andamento').length}
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
                {trips.filter((trip) => trip.status === 'finalizada').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Com ocorrencia</p>
              <p className="text-lg font-bold">
                {trips.filter((trip) => trip.status === 'com_ocorrencia').length}
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
            placeholder="Buscar saida..."
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
          <option value="com_ocorrencia">Com ocorrencia</option>
          <option value="cancelada">Cancelada</option>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((trip) => {
            const occurrence = trip.occurrence || trip.occurrenceDescription || (trip.status === 'com_ocorrencia' ? trip.observations : '');
            const canEditTrip = canWrite && trip.status === 'agendada';
            const canStartTrip = canWrite && trip.status === 'agendada';
            const canFinishTrip = canWrite && trip.status === 'em_andamento';
            const canRegisterOccurrence = canWrite && trip.status !== 'cancelada' && trip.status !== 'finalizada';
            const canCancelTrip = canWrite && trip.status === 'agendada';

            return (
              <Card key={trip.id} className="transition-shadow hover:shadow-md">
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
                                : trip.status === 'cancelada'
                                  ? 'bg-gray-50 dark:bg-gray-500/15'
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
                                  : trip.status === 'cancelada'
                                    ? 'text-gray-600 dark:text-gray-300'
                                    : 'text-emerald-600 dark:text-emerald-300'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
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
                            {statusLabels[trip.status] ?? trip.status}
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
                              ate {formatDateTime(trip.endDate)}
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

                        {trip.observations && trip.status !== 'com_ocorrencia' && (
                          <p className="mt-1 text-sm italic text-muted-foreground">
                            &ldquo;{trip.observations}&rdquo;
                          </p>
                        )}

                        {occurrence && (
                          <p className="mt-1 flex items-start gap-1.5 text-sm text-red-600 dark:text-red-300">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {occurrence}
                          </p>
                        )}

                        {canWrite && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {canStartTrip && (
                              <Button size="sm" onClick={() => handleStart(trip.id)} isLoading={actionId === trip.id}>
                                <Play className="h-3.5 w-3.5" />
                                Iniciar
                              </Button>
                            )}
                            {canFinishTrip && (
                              <Button size="sm" onClick={() => handleFinish(trip.id)} isLoading={actionId === trip.id}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Finalizar
                              </Button>
                            )}
                            {canEditTrip && (
                              <Button size="sm" variant="outline" onClick={() => openEditModal(trip)}>
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                              </Button>
                            )}
                            {canRegisterOccurrence && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-300"
                                onClick={() => setOccurrenceTrip(trip)}
                              >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Ocorrencia
                              </Button>
                            )}
                            {canCancelTrip && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                                onClick={() => setCancelTrip(trip)}
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Cancelar Saida
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Navigation}
          title="Nenhuma saida encontrada"
          description="Registre a primeira saida de uma embarcacao."
          actionLabel="Nova Saida"
          onAction={openCreateModal}
        />
      )}

      <Modal
        isOpen={showTripModal}
        onClose={closeTripModal}
        title={editingTrip ? 'Editar Saida' : 'Nova Saida'}
        description={editingTrip ? 'Atualize os dados da saida' : 'Registre uma nova saida de embarcacao'}
      >
        <form key={editingTrip?.id ?? 'new'} className="mt-4 space-y-4" onSubmit={handleSaveTrip}>
          <Select
            name="boatId"
            label="Embarcacao"
            value={selectedBoatId}
            onChange={(e) => setSelectedBoatId(e.target.value)}
            required
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
            <Select name="type" label="Tipo" defaultValue={editingTrip?.type ?? 'uso'}>
              <option value="uso">Uso (Socio)</option>
              <option value="teste">Teste (Operacional)</option>
            </Select>
            <Input
              label="Data/Hora Saida"
              name="startDate"
              type="datetime-local"
              defaultValue={toDateTimeLocal(editingTrip?.startDate)}
              required
            />
          </div>

          <Select name="responsibleUserId" label="Socio Responsavel" defaultValue={editingTrip?.responsibleUserId || ''}>
            <option value="">
              {selectedBoatId ? 'Selecione...' : 'Selecione a embarcacao primeiro'}
            </option>
            {socios.map((member) => (
              <option key={member.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>

          <Select name="sailorId" label="Marinheiro" defaultValue={editingTrip?.sailorId || ''}>
            <option value="">
              {selectedBoatId ? 'Nenhum (opcional)' : 'Selecione a embarcacao primeiro'}
            </option>
            {sailors.map((member) => (
              <option key={member.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Observacoes"
            name="observations"
            placeholder="Destino, proposito, etc. (opcional)"
            defaultValue={editingTrip?.observations || ''}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeTripModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingTrip ? 'Salvar alteracoes' : 'Registrar Saida'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(occurrenceTrip)}
        onClose={() => setOccurrenceTrip(null)}
        title="Registrar Ocorrencia"
        description={occurrenceTrip?.boatName}
      >
        <form className="mt-4 space-y-4" onSubmit={handleRegisterOccurrence}>
          <Textarea
            label="Ocorrencia"
            name="occurrence"
            placeholder="Descreva a ocorrencia da saida"
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOccurrenceTrip(null)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting}>
              Registrar ocorrencia
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(cancelTrip)}
        onClose={() => setCancelTrip(null)}
        title="Cancelar Saida"
        description={cancelTrip?.boatName}
      >
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirme o cancelamento desta saida. Esta acao altera o status da saida e nao registra ocorrencia.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCancelTrip(null)} disabled={submitting}>
              Voltar
            </Button>
            <Button type="button" variant="destructive" isLoading={submitting} onClick={() => cancelTrip && handleCancel(cancelTrip.id)}>
              Cancelar Saida
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
