'use client';

import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Ship,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats, useTrips } from '@/hooks/useEntityOptions';
import { useCanWrite } from '@/hooks/useCanWrite';
import { incidentService } from '@/services';
import { uploadFile } from '@/lib/storage';
import type { Incident } from '@/types';

const statusConfig: Record<
  string,
  { color: string; icon: React.ElementType; label: string; dotColor: string }
> = {
  pendente: {
    color:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    icon: Clock,
    label: 'Pendente',
    dotColor: 'bg-amber-500',
  },
  aprovado: {
    color:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    icon: CheckCircle,
    label: 'Aprovado',
    dotColor: 'bg-blue-500',
  },
  pago: {
    color:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    icon: CreditCard,
    label: 'Pago',
    dotColor: 'bg-emerald-500',
  },
};

export default function ChamadosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const canWrite = useCanWrite();
  const { boats } = useBoats();
  const { trips } = useTrips(selectedBoatId);

  const { data: paginatedData, loading, error, refetch } = useApi(
    () => incidentService.list(),
    [],
  );

  const incidents: Incident[] = paginatedData ?? [];

  const filtered = incidents.filter((incident) => {
    const matchesSearch =
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.boatName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'todos' || incident.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = incidents.filter((incident) => incident.status === 'pendente').length;
  const totalEstimated = incidents
    .filter((incident) => incident.status !== 'pago')
    .reduce((sum, incident) => sum + incident.estimatedCost, 0);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);

      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const results = await Promise.all(
          photos.map((photo) => uploadFile('incidents', photo)),
        );
        photoUrls = results.map((result) => result.url);
      }

      await incidentService.create({
        boatId: formData.get('boatId') as string,
        tripId: formData.get('tripId') as string,
        description: formData.get('description') as string,
        estimatedCost: Number(formData.get('estimatedCost')),
        photos: photoUrls,
      });

      setPhotos([]);
      setSelectedBoatId('');
      setShowAddModal(false);
      refetch();
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await incidentService.approve(id, { expenseMode: 'rateado' });
    refetch();
  };

  const handleMarkAsPaid = async (id: string) => {
    await incidentService.markAsPaid(id);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chamados</h1>
          <p className="text-muted-foreground">
            Registro de danos e ocorrências nas embarcações
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {pendingCount} chamado{pendingCount > 1 ? 's' : ''} pendente
              {pendingCount > 1 ? 's' : ''} de aprovação
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              Custo estimado total: {formatCurrency(totalEstimated)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar chamado..."
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
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="pago">Pago</option>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((incident) => {
            const config = statusConfig[incident.status];
            const StatusIcon = config.icon;

            return (
              <Card key={incident.id} className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          incident.status === 'pendente'
                            ? 'bg-amber-50 dark:bg-amber-500/15'
                            : incident.status === 'aprovado'
                              ? 'bg-blue-50 dark:bg-blue-500/15'
                              : 'bg-emerald-50 dark:bg-emerald-500/15'
                        }`}
                      >
                        <AlertTriangle
                          className={`h-6 w-6 ${
                            incident.status === 'pendente'
                              ? 'text-amber-600 dark:text-amber-300'
                              : incident.status === 'aprovado'
                                ? 'text-blue-600 dark:text-blue-300'
                                : 'text-emerald-600 dark:text-emerald-300'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {incident.description}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                          >
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
                            {incident.photos.length} foto
                            {incident.photos.length > 1 ? 's' : ''} anexada
                            {incident.photos.length > 1 ? 's' : ''}
                          </div>
                        )}

                        {incident.expenseMode && (
                          <Badge
                            variant={
                              incident.expenseMode === 'exclusivo'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {incident.expenseMode === 'exclusivo'
                              ? 'Custo Exclusivo'
                              : 'Custo Rateado'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(incident.estimatedCost)}
                      </p>
                      <p className="text-xs text-muted-foreground">custo estimado</p>

                      {canWrite && incident.status === 'pendente' && (
                        <div className="mt-2 space-y-1">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleApprove(incident.id)}
                          >
                            Aprovar
                          </Button>
                        </div>
                      )}

                      {canWrite && incident.status === 'aprovado' && (
                        <div className="mt-2 space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleMarkAsPaid(incident.id)}
                          >
                            Marcar Pago
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

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setPhotos([]);
          setSelectedBoatId('');
        }}
        title="Novo Chamado"
        description="Registre um dano ou ocorrência identificada"
      >
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
          <Select
            name="boatId"
            label="Embarcação"
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

          <Select name="tripId" label="Saída Relacionada" required>
            <option value="">
              {selectedBoatId ? 'Selecione...' : 'Selecione a embarcação primeiro'}
            </option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.startDate
                  ? new Date(trip.startDate).toLocaleDateString('pt-BR')
                  : trip.id}{' '}
                - {trip.status}
              </option>
            ))}
          </Select>

          <Textarea
            name="description"
            label="Descrição do dano/ocorrência"
            placeholder="Descreva o que aconteceu em detalhes..."
            required
          />

          <Input
            name="estimatedCost"
            label="Custo Estimado (R$)"
            type="number"
            placeholder="0,00"
            step="0.01"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Fotos</label>
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-input p-8 text-center transition-colors hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files).filter((file) =>
                  file.type.startsWith('image/'),
                );
                setPhotos((prev) => [...prev, ...files]);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos((prev) => [...prev, ...files]);
                  e.target.value = '';
                }}
              />
              <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Clique ou arraste fotos aqui
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG até 5MB</p>
            </div>

            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="group relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-16 w-16 rounded-lg border border-input object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, index) => index !== idx))
                      }
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setPhotos([]);
                setSelectedBoatId('');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? 'Enviando...' : 'Abrir Chamado'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
