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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockFuelings = [
  { id: '1', boatName: 'Mar Azul', date: '2026-03-05', liters: 180, totalValue: 1260, pricePerLiter: 7.0, associationType: 'socio', userName: 'Gabriel' },
  { id: '2', boatName: 'Mar Azul', date: '2026-02-28', liters: 150, totalValue: 1050, pricePerLiter: 7.0, associationType: 'socio', userName: 'Pedro' },
  { id: '3', boatName: 'Veleiro Sol', date: '2026-02-20', liters: 80, totalValue: 560, pricePerLiter: 7.0, associationType: 'socio', userName: 'Lucas' },
  { id: '4', boatName: 'Mar Azul', date: '2026-02-15', liters: 200, totalValue: 1380, pricePerLiter: 6.9, associationType: 'teste', userName: 'Técnico' },
  { id: '5', boatName: 'Mar Azul', date: '2026-02-10', liters: 160, totalValue: 1104, pricePerLiter: 6.9, associationType: 'socio', userName: 'Gabriel' },
  { id: '6', boatName: 'Veleiro Sol', date: '2026-02-05', liters: 90, totalValue: 621, pricePerLiter: 6.9, associationType: 'socio', userName: 'Pedro' },
];

const mockMonthlyConsumption = [
  { month: 'Out', liters: 420, cost: 2772 },
  { month: 'Nov', liters: 380, cost: 2508 },
  { month: 'Dez', liters: 510, cost: 3417 },
  { month: 'Jan', liters: 450, cost: 3105 },
  { month: 'Fev', liters: 680, cost: 4715 },
  { month: 'Mar', liters: 180, cost: 1260 },
];

const mockBoatConsumption = [
  { boat: 'Mar Azul', totalLiters: 690, totalCost: 4794, avgPerTrip: 172.5, trips: 4 },
  { boat: 'Veleiro Sol', totalCost: 1181, totalLiters: 170, avgPerTrip: 85, trips: 2 },
];

export default function CombustivelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBoat, setFilterBoat] = useState('');

  const totalLiters = mockFuelings.reduce((sum, f) => sum + f.liters, 0);
  const totalCost = mockFuelings.reduce((sum, f) => sum + f.totalValue, 0);
  const avgPrice = totalCost / totalLiters;
  const avgPerTrip = totalLiters / 6; // mock trips

  const maxMonthLiters = Math.max(...mockMonthlyConsumption.map((m) => m.liters));

  const filtered = filterBoat
    ? mockFuelings.filter((f) => f.boatName === filterBoat)
    : mockFuelings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Combustível</h1>
          <p className="text-muted-foreground">Abastecimentos e consumo das embarcações</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Abastecimento
        </Button>
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
              {mockMonthlyConsumption.map((month) => (
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
            {mockBoatConsumption.map((boat) => (
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
                    <p className="text-lg font-bold">{boat.avgPerTrip}L</p>
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
            <option value="Mar Azul">Mar Azul</option>
            <option value="Veleiro Sol">Veleiro Sol</option>
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
                    <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">{formatCurrency(fueling.pricePerLiter)}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold">{formatCurrency(fueling.totalValue)}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={fueling.associationType === 'teste' ? 'outline' : 'secondary'}>
                        {fueling.associationType === 'teste' ? 'Teste' : 'Sócio'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{fueling.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Abastecimento">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Select label="Embarcação">
            <option value="1">Mar Azul</option>
            <option value="2">Veleiro Sol</option>
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Litros" type="number" placeholder="0" required />
            <Input label="Valor Total (R$)" type="number" placeholder="0,00" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data" type="date" required />
            <Select label="Associação">
              <option value="socio">Sócio</option>
              <option value="teste">Teste</option>
            </Select>
          </div>
          <Input label="Observações" placeholder="Opcional" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
