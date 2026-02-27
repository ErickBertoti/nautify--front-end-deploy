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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockPartners = [
  {
    id: '1', name: 'Gabriel Santos', email: 'gabriel@email.com', phone: '(11) 99999-1234',
    boatName: 'Mar Azul', role: 'admin', status: 'ativo', participationPercent: 40,
    monthlyContribution: 4200, joinedAt: '2024-06-01', totalContributed: 92400, pendingPayments: 0,
    avatarInitials: 'GS',
  },
  {
    id: '2', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 98888-5678',
    boatName: 'Mar Azul', role: 'socio', status: 'ativo', participationPercent: 35,
    monthlyContribution: 3675, joinedAt: '2024-06-01', totalContributed: 80850, pendingPayments: 3675,
    avatarInitials: 'PO',
  },
  {
    id: '3', name: 'Lucas Ferreira', email: 'lucas@email.com', phone: '(11) 97777-9012',
    boatName: 'Mar Azul', role: 'socio', status: 'ativo', participationPercent: 25,
    monthlyContribution: 2625, joinedAt: '2025-01-01', totalContributed: 36750, pendingPayments: 5250,
    avatarInitials: 'LF',
  },
  {
    id: '4', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 96666-3456',
    boatName: 'Veleiro Sol', role: 'admin', status: 'ativo', participationPercent: 50,
    monthlyContribution: 3000, joinedAt: '2025-03-01', totalContributed: 36000, pendingPayments: 0,
    avatarInitials: 'AC',
  },
  {
    id: '5', name: 'Marcos Silva', email: 'marcos@email.com', phone: '(11) 95555-7890',
    boatName: 'Veleiro Sol', role: 'socio', status: 'inativo', participationPercent: 50,
    monthlyContribution: 3000, joinedAt: '2025-03-01', totalContributed: 18000, pendingPayments: 0,
    avatarInitials: 'MS',
  },
];

const mockContributions = [
  { id: '1', partner: 'Gabriel Santos', month: 'Março 2026', amount: 4200, status: 'pago', paidAt: '2026-03-01' },
  { id: '2', partner: 'Pedro Oliveira', month: 'Março 2026', amount: 3675, status: 'pendente', paidAt: null },
  { id: '3', partner: 'Lucas Ferreira', month: 'Março 2026', amount: 2625, status: 'atrasado', paidAt: null },
  { id: '4', partner: 'Lucas Ferreira', month: 'Fevereiro 2026', amount: 2625, status: 'atrasado', paidAt: null },
  { id: '5', partner: 'Ana Costa', month: 'Março 2026', amount: 3000, status: 'pago', paidAt: '2026-03-02' },
];

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

export default function SociosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'socios' | 'contribuicoes'>('socios');

  const ativos = mockPartners.filter((p) => p.status === 'ativo').length;
  const totalContrib = mockContributions.reduce((s, c) => s + c.amount, 0);
  const totalPending = mockContributions.filter((c) => c.status !== 'pago').reduce((s, c) => s + c.amount, 0);

  const filteredPartners = mockPartners.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        <StatCard title="Total Sócios" value={String(mockPartners.length)} subtitle="cadastrados" icon={Users} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Contribuições Mês" value={formatCurrency(totalContrib)} subtitle="total esperado" icon={DollarSign} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Pendente" value={formatCurrency(totalPending)} subtitle="a receber" icon={AlertCircle} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('socios')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === 'socios' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Sócios
        </button>
        <button
          onClick={() => setTab('contribuicoes')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === 'contribuicoes' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'
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
                        {partner.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">{partner.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>{status.label}</span>
                          <Badge variant="outline">{roleLabels[partner.role]}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {partner.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {partner.phone}</span>
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
                  {mockContributions.map((contrib) => {
                    const status = contribStatusConfig[contrib.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={contrib.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{contrib.partner}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{contrib.month}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(contrib.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" /> {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{contrib.paidAt ? formatDate(contrib.paidAt) : '—'}</td>
                        <td className="px-6 py-4">
                          {contrib.status !== 'pago' && <Button variant="ghost" size="sm">Confirmar</Button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Sócio">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <Input label="Nome Completo" placeholder="Ex: João Silva" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="E-mail" type="email" placeholder="email@exemplo.com" required />
            <Input label="Telefone" placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Embarcação">
              <option value="1">Mar Azul</option>
              <option value="2">Veleiro Sol</option>
            </Select>
            <Select label="Perfil">
              <option value="socio">Sócio</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Participação (%)" type="number" placeholder="0" required />
            <Input label="Contribuição Mensal (R$)" type="number" placeholder="0,00" required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Adicionar Sócio</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
