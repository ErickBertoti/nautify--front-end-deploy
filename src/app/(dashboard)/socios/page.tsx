'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  DollarSign,
  UserCheck,
  UserX,
  Percent,
  Ship,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
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
import { useBoats } from '@/hooks/useEntityOptions';
import { partnerService } from '@/services';
import type { Partner, PartnerContribution } from '@/types';

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'bg-emerald-50 text-emerald-700' },
  inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-700' },
  suspenso: { label: 'Suspenso', color: 'bg-red-50 text-red-700' },
};

const contribStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pago: { label: 'Pago', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-amber-50 text-amber-700', icon: Clock },
  atrasado: { label: 'Atrasado', color: 'bg-red-50 text-red-700', icon: AlertCircle },
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  socio: 'Sócio',
  marinheiro: 'Marinheiro',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function SociosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'socios' | 'contribuicoes'>('socios');
  const { boats } = useBoats();

  const { data: partnersData, loading: loadingPartners, error: errorPartners, refetch: refetchPartners } = useApi(
    () => partnerService.list(),
    [],
  );

  // Fetch contributions for all partners — use first partner id or a sentinel
  const { data: contributionsData, loading: loadingContributions, error: errorContributions, refetch: refetchContributions } = useApi(
    () => partnerService.listAllContributions(),
    [],
  );

  const refetch = () => {
    refetchPartners();
    refetchContributions();
  };

  const partners: Partner[] = partnersData ?? [];
  const contributions: PartnerContribution[] = contributionsData ?? [];

  const ativos = partners.filter((p) => p.status === 'ativo').length;
  const totalContrib = contributions.reduce((s, c) => s + c.amount, 0);
  const totalPending = contributions.filter((c) => c.status !== 'pago').reduce((s, c) => s + c.amount, 0);

  const filteredPartners = partners.filter((p) => {
    if (search && !p.user.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreatePartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await partnerService.create({
      user: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || undefined,
      },
      boatId: formData.get('boatId') as string,
      role: formData.get('role') as Partner['role'],
      participationPercent: Number(formData.get('participationPercent')),
      monthlyContribution: Number(formData.get('monthlyContribution')),
    } as Partial<Partner>);
    setIsModalOpen(false);
    refetch();
  };

  const handleDeactivatePartner = async (id: string) => {
    await partnerService.deactivate(id);
    refetch();
  };

  const handlePayContribution = async (contributionId: string) => {
    await partnerService.payContribution(contributionId);
    refetch();
  };

  const handleGenerateContributions = async () => {
    const res = await partnerService.generateContributions();
    refetchContributions();
  };

  const loading = loadingPartners || loadingContributions;
  const error = errorPartners || errorContributions;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-nautify-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sócios</h1>
          <p className="text-muted-foreground">Gestão de sócios e contribuições</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Sócio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sócios Ativos" value={String(ativos)} subtitle="participantes" icon={UserCheck} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total Sócios" value={String(partners.length)} subtitle="cadastrados" icon={Users} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Contribuições Mês" value={formatCurrency(totalContrib)} subtitle="total esperado" icon={DollarSign} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Pendente" value={formatCurrency(totalPending)} subtitle="a receber" icon={AlertCircle} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('socios')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'socios' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          Sócios
        </button>
        <button
          onClick={() => setTab('contribuicoes')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'contribuicoes' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          Contribuições
        </button>
      </div>

      {tab === 'socios' ? (
        <>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar sócio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {/* Partner Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPartners.map((partner) => {
              const status = statusConfig[partner.status];
              return (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-nautify-100 flex items-center justify-center text-nautify-700 font-bold text-sm shrink-0">
                        {getInitials(partner.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">{partner.user.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>{status.label}</span>
                          <Badge variant="outline">{roleLabels[partner.role]}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {partner.user.email}</span>
                          {partner.user.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {partner.user.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary"><Ship className="h-3 w-3 mr-1" /> {partner.boatName}</Badge>
                          <Badge variant="secondary"><Percent className="h-3 w-3 mr-1" /> {partner.participationPercent}%</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3 p-3 bg-muted/50 rounded-lg text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Mensal</p>
                            <p className="text-sm font-bold">{formatCurrency(partner.monthlyContribution)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Pago</p>
                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(partner.totalContributed)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pendente</p>
                            <p className={`text-sm font-bold ${partner.pendingPayments > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {partner.pendingPayments > 0 ? formatCurrency(partner.pendingPayments) : '—'}
                            </p>
                          </div>
                        </div>
                        {partner.status === 'ativo' && (
                          <div className="mt-3 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600 text-xs" onClick={() => handleDeactivatePartner(partner.id)}>
                              <UserX className="h-3.5 w-3.5 mr-1" /> Desativar
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
        </>
      ) : (
        /* Contributions Tab */
        <>
        <div className="flex justify-end">
          <Button onClick={handleGenerateContributions}>
            <DollarSign className="h-4 w-4 mr-2" /> Gerar Contribuições do Mês
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Sócio</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Mês</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Valor</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Pago em</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contributions.map((contrib) => {
                    const status = contribStatusConfig[contrib.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={contrib.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{contrib.partnerUser?.name ?? '—'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{contrib.month}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(contrib.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" /> {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{contrib.paidAt ? formatDate(contrib.paidAt) : '—'}</td>
                        <td className="px-6 py-4">
                          {contrib.status !== 'pago' && <Button variant="ghost" size="sm" onClick={() => handlePayContribution(contrib.id)}>Confirmar</Button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Sócio">
        <form className="space-y-4" onSubmit={handleCreatePartner}>
          <Input name="name" label="Nome Completo" placeholder="Ex: João Silva" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="email" label="E-mail" type="email" placeholder="email@exemplo.com" required />
            <Input name="phone" label="Telefone" placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="boatId" label="Embarcação" required>
              <option value="">Selecione...</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Select name="role" label="Perfil">
              <option value="socio">Sócio</option>
              <option value="admin">Administrador</option>
              <option value="marinheiro">Marinheiro</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="participationPercent" label="Participação (%)" type="number" placeholder="0" required />
            <Input name="monthlyContribution" label="Mensalidade (R$)" type="number" placeholder="0,00" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar Sócio</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
