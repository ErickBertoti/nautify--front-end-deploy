'use client';

import React, { useRef, useState } from 'react';
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
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { incidentService } from '@/services';
import { uploadFile } from '@/lib/storage';
import type { Incident } from '@/types';

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string; dotColor: string }> = {
  pendente: { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pendente', dotColor: 'bg-amber-500' },
  aprovado: { color: 'bg-blue-50 text-blue-700', icon: CheckCircle, label: 'Aprovado', dotColor: 'bg-blue-500' },
  pago: { color: 'bg-emerald-50 text-emerald-700', icon: CreditCard, label: 'Pago', dotColor: 'bg-emerald-500' },
};

export default function ChamadosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: paginatedData, loading, error, refetch } = useApi(
    () => incidentService.list(),
    [],
  );

  const incidents: Incident[] = paginatedData?.data ?? [];

  const filtered = incidents.filter((i) => {
    const matchesSearch =
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.boatName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = incidents.filter((i) => i.status === 'pendente').length;
  const totalEstimated = incidents
    .filter((i) => i.status !== 'pago')
    .reduce((sum, i) => sum + i.estimatedCost, 0);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData(e.currentTarget);

      // Upload photos to Supabase Storage
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const results = await Promise.all(
          photos.map(photo => uploadFile('incidents', photo))
        );
        photoUrls = results.map(r => r.url);
      }

      await incidentService.create({
        boatId: formData.get('boatId') as string,
        tripId: formData.get('tripId') as string,
        description: formData.get('description') as string,
        estimatedCost: Number(formData.get('estimatedCost')),
        photos: photoUrls,
      });

      setPhotos([]);
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
                          <Button size="sm" className="w-full" onClick={() => handleApprove(incident.id)}>
                            Aprovar
                          </Button>
                        </div>
                      )}
                      {incident.status === 'aprovado' && (
                        <div className="mt-2 space-y-1">
                          <Button size="sm" variant="outline" className="w-full" onClick={() => handleMarkAsPaid(incident.id)}>
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setPhotos([]); }}
        title="Novo Chamado"
        description="Registre um dano ou ocorrência identificada"
      >
        <form className="space-y-4 mt-4" onSubmit={handleCreate}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select name="boatId" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Saída Relacionada</label>
            <select name="tripId" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="2">25/02/2026 - Ricardo Mendes</option>
              <option value="1">27/02/2026 - Gabriel Silva (em andamento)</option>
            </select>
          </div>
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
              className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files).filter(f =>
                  f.type.startsWith('image/')
                );
                setPhotos(prev => [...prev, ...files]);
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
                  setPhotos(prev => [...prev, ...files]);
                  e.target.value = '';
                }}
              />
              <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Clique ou arraste fotos aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-16 w-16 object-cover rounded-lg border border-input"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => { setShowAddModal(false); setPhotos([]); }}>
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
