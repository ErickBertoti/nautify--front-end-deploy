'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ship, Plus, Users, MapPin, Search, Calendar, Loader2, Camera } from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { BOAT_TYPE_LABELS, SUBSCRIPTION_STATUS_META } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { useCanCreateBoat } from '@/hooks/useBoatPermissions';
import { useUser } from '@/contexts/UserContext';
import { getErrorMessage } from '@/lib/errors';
import { boatService } from '@/services';
import type { Boat } from '@/types';

export default function EmbarcacoesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [boatImage, setBoatImage] = useState<File | null>(null);
  const router = useRouter();
  const toast = useToast();
  const canWrite = useCanCreateBoat();
  const { refetch: refetchUser } = useUser();
  const { data: boats, loading, error, refetch } = useApi<Boat[]>(() => boatService.list());

  const handleCreateBoat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      let imageUrl: string | undefined;
      if (boatImage) {
        const { url } = await uploadFile('boats', boatImage);
        imageUrl = url;
      }
      await boatService.create({
        name: form.get('name') as string,
        type: form.get('type') as Boat['type'],
        model: form.get('model') as string || undefined,
        year: form.get('year') ? Number(form.get('year')) : undefined,
        registrationNumber: form.get('registrationNumber') as string || undefined,
        marinaName: form.get('marinaName') as string || undefined,
        isRental: form.get('isRental') === 'on',
        imageUrl,
      });
      setShowAddModal(false);
      setBoatImage(null);
      refetch();
      refetchUser();
      toast.success('Embarcação criada com sucesso!');
      router.push('/assinaturas');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar embarcação.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBoats = (boats || []).filter(
    (boat) =>
      boat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boat.model?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getActiveMembers = (boat: Boat) =>
    boat.members?.filter((member) => member.isActive && member.role !== 'marinheiro') || [];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Embarcações</h1>
          <p className="text-muted-foreground">Gerencie suas embarcações e sócios</p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Nova Embarcação
          </Button>
        )}
      </div>

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

      {filteredBoats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBoats.map((boat) => (
            <Link href={`/embarcacoes/${boat.id}`} key={boat.id} className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-border/60 group-hover:border-nautify-500/50">
                <CardContent className="p-0">
                  <div className="relative h-36 rounded-t-xl overflow-hidden">
                    {boat.imageUrl ? (
                      <img src={boat.imageUrl} alt={boat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-nautify-600 to-nautify-800 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10">
                          <svg className="w-full h-full" viewBox="0 0 400 160">
                            <path d="M0 80 Q100 30 200 80 T400 80" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M0 120 Q100 70 200 120 T400 120" fill="none" stroke="white" strokeWidth="1" />
                          </svg>
                        </div>
                        <Ship className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0">
                        {BOAT_TYPE_LABELS[boat.type]}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-4">
                      <h3 className="text-xl font-bold text-white">{boat.name}</h3>
                      {boat.model && (
                        <p className="text-sm text-white/70">
                          {boat.model}
                          {boat.year && ` • ${boat.year}`}
                        </p>
                      )}
                    </div>
                  </div>

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
                        {getActiveMembers(boat).length} sócio
                        {getActiveMembers(boat).length !== 1 ? 's' : ''} ativo
                        {getActiveMembers(boat).length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Reg. {boat.registrationNumber}</span>
                    </div>

                    {boat.subscription && (() => {
                      const badge = SUBSCRIPTION_STATUS_META[boat.subscription.status];
                      return (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {badge.label}
                        </div>
                      );
                    })()}

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {(boat.members || []).slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-nautify-100 border-2 border-card flex items-center justify-center text-xs font-medium text-nautify-700"
                            title={member.user.name}
                          >
                            {member.user.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                          </div>
                        ))}
                        {(boat.members || []).length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{(boat.members || []).length - 4}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:bg-nautify-50 group-hover:text-nautify-700 transition-colors cursor-pointer">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
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

      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setBoatImage(null); }}
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
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Foto da embarcação</label>
            <input type="file" accept="image/png,image/jpeg" className="hidden" id="boat-image-input"
              onChange={(e) => setBoatImage(e.target.files?.[0] || null)} />
            <label htmlFor="boat-image-input" className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-nautify-300 transition-colors cursor-pointer block">
              {boatImage ? (
                <>
                  <img src={URL.createObjectURL(boatImage)} alt="Preview" className="h-24 w-full object-cover rounded-lg mb-2" />
                  <p className="text-xs text-muted-foreground">Clique para trocar</p>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar foto</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG — opcional</p>
                </>
              )}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isRental" id="isRental" className="rounded border-border" />
            <label htmlFor="isRental" className="text-sm">Equipamento de aluguel</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => { setShowAddModal(false); setBoatImage(null); }}>
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
