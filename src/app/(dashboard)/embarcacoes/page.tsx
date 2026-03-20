'use client';

import React, { useState } from 'react';
import { Ship, Plus, Users, MapPin, Search, MoreVertical, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { BOAT_TYPE_LABELS } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { boatService } from '@/services';
import type { Boat } from '@/types';

export default function EmbarcacoesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { data: boats, loading, error, refetch } = useApi<Boat[]>(() => boatService.list());

  const handleCreateBoat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      await boatService.create({
        name: form.get('name') as string,
        type: form.get('type') as Boat['type'],
        model: form.get('model') as string || undefined,
        year: form.get('year') ? Number(form.get('year')) : undefined,
        registrationNumber: form.get('registrationNumber') as string || undefined,
        marinaName: form.get('marinaName') as string || undefined,
      });
      setShowAddModal(false);
      refetch();
    } catch (err) {
      console.error('Erro ao criar embarcação:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBoats = (boats || []).filter(
    (boat) =>
      boat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boat.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActiveMembers = (boat: Boat) => boat.members?.filter((m) => m.isActive && m.role !== 'marinheiro') || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-nautify-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Embarcações</h1>
          <p className="text-muted-foreground">Gerencie suas embarcações e sócios</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Nova Embarcação
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar embarcação..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
      </div>

      {/* Boats Grid */}
      {filteredBoats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBoats.map((boat) => (
            <Card key={boat.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-0">
                {/* Header visual */}
                <div className="relative h-36 bg-gradient-to-br from-nautify-600 to-nautify-800 rounded-t-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 160">
                      <path d="M0 80 Q100 30 200 80 T400 80" fill="none" stroke="white" strokeWidth="2" />
                      <path d="M0 120 Q100 70 200 120 T400 120" fill="none" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>
                  <Ship className="h-16 w-16 text-white/30" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0">
                      {BOAT_TYPE_LABELS[boat.type]}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-xl font-bold text-white">{boat.name}</h3>
                    {boat.model && (
                      <p className="text-sm text-white/70">{boat.model} {boat.year && `• ${boat.year}`}</p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  {boat.marinaName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{boat.marinaName} — {boat.marinaLocation}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>
                      {getActiveMembers(boat).length} sócio{getActiveMembers(boat).length !== 1 ? 's' : ''} ativo{getActiveMembers(boat).length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Reg. {boat.registrationNumber}</span>
                  </div>

                  {/* Members Avatars */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {(boat.members || []).slice(0, 4).map((member, idx) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-nautify-100 border-2 border-card flex items-center justify-center text-xs font-medium text-nautify-700"
                          title={member.user.name}
                        >
                          {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      ))}
                      {(boat.members || []).length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{(boat.members || []).length - 4}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ship}
          title="Nenhuma embarcação"
          description="Adicione sua primeira embarcação para começar a gerenciar sócios, despesas e saídas."
          actionLabel="Nova Embarcação"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nova Embarcação"
        description="Preencha os dados da embarcação"
      >
        <form className="space-y-4 mt-4" onSubmit={handleCreateBoat}>
          <Input name="name" label="Nome da embarcação" placeholder="Ex: Mar Azul" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo" placeholder="Selecione o tipo">
              <option value="lancha">Lancha</option>
              <option value="jet">Jet Ski</option>
              <option value="veleiro">Veleiro</option>
              <option value="outro">Outro</option>
            </Select>
            <Input name="year" label="Ano" type="number" placeholder="2024" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="model" label="Modelo" placeholder="Ex: Phantom 303" />
            <Input name="registrationNumber" label="Nº Registro" placeholder="Ex: BR-SP-12345" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input name="marinaName" label="Marina / Localização" placeholder="Ex: Marina Guarujá — Guarujá, SP" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</> : 'Criar Embarcação'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
