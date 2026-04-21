'use client';

import React, { useState } from 'react';
import {
  Fuel,
  Plus,
  Search,
  TrendingDown,
  BarChart3,
  Droplets,
  DollarSign,
  Ship,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats, useBoatMembers } from '@/hooks/useEntityOptions';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { fuelingService } from '@/services';
import type { Fueling, FuelConsumptionSummary } from '@/types';

export default function CombustivelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBoat, setFilterBoat] = useState('');
  const [formBoatId, setFormBoatId] = useState('');
  const [formAssociation, setFormAssociation] = useState<'socio' | 'teste'>('socio');
  const canWrite = useHasAnyBoat();
  const { boats } = useBoats();
  const { socios: formSocios } = useBoatMembers(formBoatId);

  const { data: fuelings, loading: loadingFuelings, error: errorFuelings, refetch: refetchFuelings } = useApi<Fueling[]>(
    () => fuelingService.list(),
  );

  const { data: summary, loading: loadingSummary, error: errorSummary, refetch: refetchSummary } = useApi<FuelConsumptionSummary>(
    () => fuelingService.getConsumptionSummary(),
  );

  const loading = loadingFuelings || loadingSummary;
  const error = errorFuelings || errorSummary;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !fuelings || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar dados de combustível'}</p>
        <Button variant="outline" size="sm" onClick={() => { refetchFuelings(); refetchSummary(); }}>Tentar novamente</Button>
      </div>
    );
  }

  const refetch = () => {
    refetchFuelings();
    refetchSummary();
  };

  const totalLiters = summary.totalLiters;
  const totalCost = summary.totalCost;
  const avgPrice = summary.avgPricePerLiter;
  const avgPerTrip = summary.avgLitersPerTrip;

  const monthlyData = summary.monthlyData || [];
  const maxMonthLiters = monthlyData.length > 0 ? Math.max(...monthlyData.map((m) => m.liters)) : 1;

  // Derive per-boat breakdown from fuelings list
  const boatMap = new Map<string, { boat: string; totalLiters: number; totalCost: number; trips: number }>();
  for (const f of fuelings) {
    const name = f.boatName || 'Desconhecida';
    const existing = boatMap.get(name) || { boat: name, totalLiters: 0, totalCost: 0, trips: 0 };
    existing.totalLiters += f.liters;
    existing.totalCost += f.totalValue;
    existing.trips += 1;
    boatMap.set(name, existing);
  }
  const boatConsumption = Array.from(boatMap.values()).map((b) => ({
    ...b,
    avgPerTrip: b.trips > 0 ? b.totalLiters / b.trips : 0,
  }));

  const filtered = filterBoat
    ? fuelings.filter((f) => f.boatName === filterBoat)
    : fuelings;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const associationType = formData.get('associationType') as Fueling['associationType'];
    const associatedUserId = (formData.get('associatedUserId') as string) || undefined;
    if (associationType === 'socio' && !associatedUserId) {
      alert('Selecione o sócio responsável pelo abastecimento.');
      return;
    }
    await fuelingService.create({
      boatId: formData.get('boatId') as string,
      liters: Number(formData.get('liters')),
      totalValue: Number(formData.get('totalValue')),
      date: formData.get('date') as string,
      associationType,
      associatedUserId: associationType === 'socio' ? associatedUserId : undefined,
      observations: (formData.get('observations') as string) || undefined,
    });
    setIsModalOpen(false);
    setFormBoatId('');
    setFormAssociation('socio');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Combustível</h1>
          <p className="text-muted-foreground">Abastecimentos e consumo das embarcações</p>
        </div>
        {canWrite && <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Abastecimento
        </Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Litros" value={`${totalLiters} L`} subtitle="abastecidos" icon={Droplets} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Custo Total" value={formatCurrency(totalCost)} subtitle="em combustível" icon={DollarSign} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Preço Médio" value={formatCurrency(avgPrice) + '/L'} subtitle="por litro" icon={TrendingDown} iconBgColor="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="Média por Saída" value={`${avgPerTrip.toFixed(0)} L`} subtitle="por viagem" icon={BarChart3} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Consumption Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Consumo Mensal (Litros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex justify-center h-32">
                    <div
                      className="w-4 sm:w-8 bg-nautify-400 rounded-t transition-all hover:bg-nautify-500"
                      style={{ height: `${(month.liters / maxMonthLiters) * 100}%` }}
                      title={`${month.liters}L - ${formatCurrency(month.cost)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{month.liters}L</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Per Boat Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-muted-foreground" />
              Consumo por Embarcação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {boatConsumption.map((boat) => (
              <div key={boat.boat} className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{boat.boat}</span>
                  <Badge variant="secondary">{boat.trips} saídas</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-nautify-600">{boat.totalLiters}L</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatCurrency(boat.totalCost)}</p>
                    <p className="text-[10px] text-muted-foreground">Custo</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{boat.avgPerTrip.toFixed(1)}L</p>
                    <p className="text-[10px] text-muted-foreground">Média/saída</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filter + List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <Select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)} className="w-auto">
            <option value="">Todas embarcações</option>
            {Array.from(new Set(fuelings.map((f) => f.boatName).filter(Boolean))).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Embarcação</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Litros</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Preço/L</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((fueling) => (
                  <tr key={fueling.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{formatDate(fueling.date)}</td>
                    <td className="px-6 py-3.5 text-sm font-medium">{fueling.boatName}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-medium">{fueling.liters}L</td>
                    <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">{formatCurrency(fueling.pricePerLiter ?? (fueling.totalValue / fueling.liters))}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold">{formatCurrency(fueling.totalValue)}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={fueling.associationType === 'teste' ? 'outline' : 'secondary'}>
                        {fueling.associationType === 'teste' ? 'Teste' : 'Sócio'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{fueling.associatedUser?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Abastecimento">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Select
            label="Embarcação"
            name="boatId"
            value={formBoatId}
            onChange={(e) => setFormBoatId(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Litros" name="liters" type="number" placeholder="0" required />
            <Input label="Valor Total (R$)" name="totalValue" type="number" placeholder="0,00" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data" name="date" type="date" required />
            <Select
              label="Associação"
              name="associationType"
              value={formAssociation}
              onChange={(e) => setFormAssociation(e.target.value as 'socio' | 'teste')}
            >
              <option value="socio">Sócio</option>
              <option value="teste">Teste</option>
            </Select>
          </div>
          {formAssociation === 'socio' && (
            <div className="space-y-1">
              <Select
                label="Sócio responsável"
                name="associatedUserId"
                required
                disabled={!formBoatId}
              >
                <option value="">Selecione...</option>
                {formSocios.map((s) => (
                  <option key={s.user.id} value={s.user.id}>
                    {s.user.name} {s.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </Select>
              {!formBoatId && (
                <p className="text-xs text-muted-foreground">Selecione a embarcação para listar os sócios.</p>
              )}
            </div>
          )}
          <Input label="Observações" name="observations" placeholder="Opcional" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
