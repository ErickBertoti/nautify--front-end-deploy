'use client';

import React, { useMemo, useState } from 'react';
import {
  Plus,
  TrendingDown,
  BarChart3,
  Droplets,
  DollarSign,
  Ship,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate, formatDecimal, parseLocaleNumber } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats, useBoatMembers } from '@/hooks/useEntityOptions';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { fuelingService } from '@/services';
import type { FuelBreakdownItem, FuelConsumptionSummary, Fueling } from '@/types';

type FuelFormState = {
  gasolinaLiters: string;
  gasolinaValue: string;
  dieselLiters: string;
  dieselValue: string;
};

const emptyFuelForm: FuelFormState = {
  gasolinaLiters: '',
  gasolinaValue: '',
  dieselLiters: '',
  dieselValue: '',
};

function getEffectiveBreakdown(fueling: Fueling): FuelBreakdownItem[] {
  if (fueling.fuelBreakdown && fueling.fuelBreakdown.length > 0) {
    return fueling.fuelBreakdown;
  }

  return [
    {
      fuelType: 'gasolina',
      liters: fueling.liters,
      totalValue: fueling.totalValue,
      pricePerLiter: fueling.pricePerLiter ?? (fueling.liters > 0 ? fueling.totalValue / fueling.liters : 0),
    },
  ];
}

export default function CombustivelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBoat, setFilterBoat] = useState('');
  const [formBoatId, setFormBoatId] = useState('');
  const [formAssociation, setFormAssociation] = useState<'socio' | 'teste'>('socio');
  const [fuelForm, setFuelForm] = useState<FuelFormState>(emptyFuelForm);
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

  const fuelBreakdownPayload = useMemo(() => {
    const items = [
      {
        fuelType: 'gasolina' as const,
        liters: parseLocaleNumber(fuelForm.gasolinaLiters),
        totalValue: parseLocaleNumber(fuelForm.gasolinaValue),
      },
      {
        fuelType: 'diesel' as const,
        liters: parseLocaleNumber(fuelForm.dieselLiters),
        totalValue: parseLocaleNumber(fuelForm.dieselValue),
      },
    ];

    return items
      .filter((item) => item.liters > 0 && item.totalValue > 0)
      .map((item) => ({
        ...item,
        pricePerLiter: item.totalValue / item.liters,
      }));
  }, [fuelForm]);

  const totalLitersDraft = fuelBreakdownPayload.reduce((sum, item) => sum + item.liters, 0);
  const totalValueDraft = fuelBreakdownPayload.reduce((sum, item) => sum + item.totalValue, 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !fuelings || !summary) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">{error || 'Erro ao carregar dados de combustível'}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchFuelings();
            refetchSummary();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const refetch = () => {
    refetchFuelings();
    refetchSummary();
  };

  const monthlyData = summary.monthlyData || [];
  const maxMonthLiters = monthlyData.length > 0 ? Math.max(...monthlyData.map((month) => month.liters)) : 1;

  const boatMap = new Map<string, { boat: string; totalLiters: number; totalCost: number; trips: number }>();
  for (const fueling of fuelings) {
    const name = fueling.boatName || 'Desconhecida';
    const existing = boatMap.get(name) || { boat: name, totalLiters: 0, totalCost: 0, trips: 0 };
    existing.totalLiters += fueling.liters;
    existing.totalCost += fueling.totalValue;
    existing.trips += 1;
    boatMap.set(name, existing);
  }

  const boatConsumption = Array.from(boatMap.values()).map((boat) => ({
    ...boat,
    avgPerTrip: boat.trips > 0 ? boat.totalLiters / boat.trips : 0,
  }));

  const filtered = filterBoat
    ? fuelings.filter((fueling) => fueling.boatName === filterBoat)
    : fuelings;

  const resetModalState = () => {
    setIsModalOpen(false);
    setFormBoatId('');
    setFormAssociation('socio');
    setFuelForm(emptyFuelForm);
  };

  const handleFuelFieldChange = (field: keyof FuelFormState, value: string) => {
    setFuelForm((current) => ({ ...current, [field]: value }));
  };

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

    if (fuelBreakdownPayload.length === 0) {
      alert('Informe pelo menos um combustível com litros e valor.');
      return;
    }

    await fuelingService.create({
      boatId: formData.get('boatId') as string,
      liters: totalLitersDraft,
      totalValue: totalValueDraft,
      fuelBreakdown: fuelBreakdownPayload,
      date: formData.get('date') as string,
      associationType,
      associatedUserId: associationType === 'socio' ? associatedUserId : undefined,
      observations: (formData.get('observations') as string) || undefined,
    });

    resetModalState();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Combustível</h1>
          <p className="text-muted-foreground">Abastecimentos e consumo das embarcações</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Abastecimento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Litros"
          value={`${formatDecimal(summary.totalLiters)} L`}
          subtitle="abastecidos"
          icon={Droplets}
          iconBgColor="bg-blue-50 dark:bg-blue-500/15"
          iconColor="text-blue-600 dark:text-blue-300"
        />
        <StatCard
          title="Custo Total"
          value={formatCurrency(summary.totalCost)}
          subtitle="em combustível"
          icon={DollarSign}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
          iconColor="text-amber-600 dark:text-amber-300"
        />
        <StatCard
          title="Preço Médio"
          value={`${formatCurrency(summary.avgPricePerLiter)}/L`}
          subtitle="por litro"
          icon={TrendingDown}
          iconBgColor="bg-purple-50 dark:bg-purple-500/15"
          iconColor="text-purple-600 dark:text-purple-300"
        />
        <StatCard
          title="Média por Saída"
          value={`${formatDecimal(summary.avgLitersPerTrip)} L`}
          subtitle="por viagem"
          icon={BarChart3}
          iconBgColor="bg-emerald-50 dark:bg-emerald-500/15"
          iconColor="text-emerald-600 dark:text-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Consumo Mensal (Litros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-3">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-32 w-full justify-center">
                    <div
                      className="w-4 rounded-t bg-nautify-400 transition-all hover:bg-nautify-500 sm:w-8"
                      style={{ height: `${(month.liters / maxMonthLiters) * 100}%` }}
                      title={`${formatDecimal(month.liters)}L - ${formatCurrency(month.cost)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {formatDecimal(month.liters)}L
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-muted-foreground" />
              Consumo por Embarcação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {boatConsumption.map((boat) => (
              <div key={boat.boat} className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{boat.boat}</span>
                  <Badge variant="secondary">{boat.trips} abastecimentos</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-nautify-600 dark:text-nautify-300">
                      {formatDecimal(boat.totalLiters)}L
                    </p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatCurrency(boat.totalCost)}</p>
                    <p className="text-[10px] text-muted-foreground">Custo</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatDecimal(boat.avgPerTrip)}L</p>
                    <p className="text-[10px] text-muted-foreground">Média/abast.</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <Select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)} className="w-auto">
            <option value="">Todas embarcações</option>
            {Array.from(new Set(fuelings.map((fueling) => fueling.boatName).filter(Boolean))).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Embarcação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Combustíveis</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Litros</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Preço/L</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((fueling) => {
                  const breakdown = getEffectiveBreakdown(fueling);
                  const averagePrice = fueling.pricePerLiter ?? (fueling.liters > 0 ? fueling.totalValue / fueling.liters : 0);

                  return (
                    <tr key={fueling.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{formatDate(fueling.date)}</td>
                      <td className="px-6 py-3.5 text-sm font-medium">{fueling.boatName}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-2">
                          {breakdown.map((item) => (
                            <Badge key={`${fueling.id}-${item.fuelType}`} variant="outline" className="capitalize">
                              {item.fuelType} {formatDecimal(item.liters)}L
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-medium">{formatDecimal(fueling.liters)}L</td>
                      <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">{formatCurrency(averagePrice)}</td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold">{formatCurrency(fueling.totalValue)}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant={fueling.associationType === 'teste' ? 'outline' : 'secondary'}>
                          {fueling.associationType === 'teste' ? 'Teste' : 'Sócio'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{fueling.associatedUser?.name || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={resetModalState} title="Novo Abastecimento">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Select
            label="Embarcação"
            name="boatId"
            value={formBoatId}
            onChange={(e) => setFormBoatId(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {boats.map((boat) => (
              <option key={boat.id} value={boat.id}>
                {boat.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <h3 className="text-sm font-semibold">Gasolina</h3>
                <p className="text-xs text-muted-foreground">Aceita litros com casas decimais, como 340,89.</p>
              </div>
              <Input
                label="Litros"
                inputMode="decimal"
                placeholder="340,89"
                value={fuelForm.gasolinaLiters}
                onChange={(e) => handleFuelFieldChange('gasolinaLiters', e.target.value)}
              />
              <Input
                label="Valor (R$)"
                inputMode="decimal"
                placeholder="1.000,99"
                value={fuelForm.gasolinaValue}
                onChange={(e) => handleFuelFieldChange('gasolinaValue', e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <h3 className="text-sm font-semibold">Diesel</h3>
                <p className="text-xs text-muted-foreground">Preencha só quando esse mesmo abastecimento tiver diesel.</p>
              </div>
              <Input
                label="Litros"
                inputMode="decimal"
                placeholder="120,50"
                value={fuelForm.dieselLiters}
                onChange={(e) => handleFuelFieldChange('dieselLiters', e.target.value)}
              />
              <Input
                label="Valor (R$)"
                inputMode="decimal"
                placeholder="650,40"
                value={fuelForm.dieselValue}
                onChange={(e) => handleFuelFieldChange('dieselValue', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de litros</p>
              <p className="text-lg font-semibold">{formatDecimal(totalLitersDraft)} L</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor total</p>
              <p className="text-lg font-semibold">{formatCurrency(totalValueDraft)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                {formSocios.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name} {member.role === 'admin' ? '(Admin)' : ''}
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
            <Button type="button" variant="outline" className="flex-1" onClick={resetModalState}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
