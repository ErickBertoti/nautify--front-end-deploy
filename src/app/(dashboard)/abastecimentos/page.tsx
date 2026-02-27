'use client';

import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Search,
  Ship,
  Calendar,
  Droplets,
  DollarSign,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import type { Fueling } from '@/types';

const mockFuelings: Fueling[] = [
  {
    id: '1',
    boatId: '1',
    boatName: 'Mar Azul',
    date: '2026-02-25',
    liters: 120,
    totalValue: 960,
    associationType: 'socio',
    associatedUser: { id: '1', name: 'Gabriel Silva', email: '', createdAt: '' },
    associatedUserId: '1',
    observations: 'Tanque cheio antes do passeio',
    createdAt: '2026-02-25',
  },
  {
    id: '2',
    boatId: '1',
    boatName: 'Mar Azul',
    date: '2026-02-23',
    liters: 50,
    totalValue: 400,
    associationType: 'teste',
    associatedTripId: '3',
    observations: 'Abastecimento para teste do motor',
    createdAt: '2026-02-23',
  },
  {
    id: '3',
    boatId: '2',
    boatName: 'Veleiro Sol',
    date: '2026-02-22',
    liters: 80,
    totalValue: 640,
    associationType: 'socio',
    associatedUser: { id: '5', name: 'Ana Paula', email: '', createdAt: '' },
    associatedUserId: '5',
    createdAt: '2026-02-22',
  },
];

export default function AbastecimentosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalLiters = mockFuelings.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = mockFuelings.reduce((sum, f) => sum + f.totalValue, 0);
  const avgPricePerLiter = totalCost / totalLiters;

  const filtered = mockFuelings.filter(
    (f) =>
      f.boatName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.associatedUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.observations?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abastecimentos</h1>
          <p className="text-muted-foreground">Controle de abastecimentos das embarcações</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Novo Abastecimento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total de Litros"
          value={`${totalLiters}L`}
          subtitle="no mês atual"
          icon={Droplets}
          iconBgColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <StatCard
          title="Custo Total"
          value={formatCurrency(totalCost)}
          subtitle="em combustível"
          icon={DollarSign}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Preço Médio/Litro"
          value={formatCurrency(avgPricePerLiter)}
          subtitle="média do mês"
          icon={Fuel}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar abastecimento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((fueling) => (
            <Card key={fueling.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-50">
                      <Fuel className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{fueling.boatName}</h3>
                        <Badge variant={fueling.associationType === 'teste' ? 'outline' : 'secondary'}>
                          {fueling.associationType === 'teste' ? 'Teste (Rateado)' : 'Sócio'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(fueling.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Droplets className="h-3.5 w-3.5" />
                          {fueling.liters}L
                        </span>
                        {fueling.associatedUser && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {fueling.associatedUser.name}
                          </span>
                        )}
                      </div>
                      {fueling.observations && (
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{fueling.observations}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(fueling.totalValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(fueling.totalValue / fueling.liters)}/L
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Fuel}
          title="Nenhum abastecimento"
          description="Registre o primeiro abastecimento de uma embarcação."
          actionLabel="Novo Abastecimento"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Novo Abastecimento"
        description="Todo abastecimento deve estar associado a um sócio ou saída de teste"
      >
        <form className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Embarcação</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Mar Azul - Phantom 303</option>
              <option value="2">Veleiro Sol - Beneteau 34</option>
            </select>
          </div>
          <Input label="Data" type="date" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Litros" type="number" placeholder="0" step="0.1" required />
            <Input label="Valor Total (R$)" type="number" placeholder="0,00" step="0.01" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Associação</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="socio">Sócio (Individual)</option>
              <option value="teste">Saída de Teste (Rateado)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Sócio / Saída</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1">Gabriel Silva</option>
              <option value="2">Ricardo Mendes</option>
            </select>
          </div>
          <Textarea label="Observações" placeholder="Detalhes (opcional)" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
