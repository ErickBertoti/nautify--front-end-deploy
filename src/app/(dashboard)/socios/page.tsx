'use client';

import React, { useMemo, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoatMembers, useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyAdminBoat, useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import { partnerService } from '@/services';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { currencyToInputValue, formatCurrencyInput, maskPhone, parseCurrencyInput } from '@/lib/form-formatters';
import { getPaymentMethodLabel, getRefundStatusLabel, PAYMENT_METHOD_OPTIONS } from '@/lib/financial';
import type { Partner, PartnerContribution, PaymentMethod, UserRole } from '@/types';

type PaymentMethodSelection = PaymentMethod | '';

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

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  socio: 'Sócio',
  marinheiro: 'Marinheiro',
};

const initialPartnerForm = {
  id: '',
  boatId: '',
  name: '',
  email: '',
  phone: '',
  role: 'socio' as UserRole,
  participationPercent: '',
  monthlyContribution: '',
  status: 'ativo' as Partner['status'],
};

const initialContributionPaymentForm = {
  paidByUserId: '',
  paymentMethod: '' as PaymentMethodSelection,
  notes: '',
  paidAt: new Date().toISOString().slice(0, 10),
};

const initialContributionRefundForm = {
  refundAmount: '',
  reason: '',
  refundedAt: new Date().toISOString().slice(0, 10),
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function SociosPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'socios' | 'contribuicoes'>('socios');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState(initialPartnerForm);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerToDeactivate, setPartnerToDeactivate] = useState<Partner | null>(null);
  const [contributionToPay, setContributionToPay] = useState<PartnerContribution | null>(null);
  const [contributionPaymentForm, setContributionPaymentForm] = useState(initialContributionPaymentForm);
  const [contributionToRefund, setContributionToRefund] = useState<PartnerContribution | null>(null);
  const [contributionRefundForm, setContributionRefundForm] = useState(initialContributionRefundForm);

  const toast = useToast();
  const canManagePartners = useHasAnyAdminBoat();
  const canViewPartners = useHasAnyFinancialBoat();
  const { boats } = useBoats();
  const activeContributionBoatId = contributionToPay?.boatId ?? partnerForm.boatId;
  const { socios: boatSocios } = useBoatMembers(activeContributionBoatId);

  const { data: partnersData, loading: loadingPartners, error: errorPartners, refetch: refetchPartners } = useApi<Partner[]>(
    () => partnerService.list({ limit: 200 }),
    [],
  );

  const { data: contributionsData, loading: loadingContributions, error: errorContributions, refetch: refetchContributions } = useApi<PartnerContribution[]>(
    () => partnerService.listAllContributions({ limit: 200 }),
    [],
  );

  const partners = partnersData ?? [];
  const contributions = contributionsData ?? [];

  const ativos = partners.filter((partner) => partner.status === 'ativo').length;
  const totalContrib = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const totalPending = contributions.filter((contribution) => contribution.status !== 'pago').reduce((sum, contribution) => sum + contribution.amount, 0);

  const filteredPartners = useMemo(() => partners.filter((partner) => {
    if (!search) {
      return true;
    }
    const haystack = `${partner.user.name} ${partner.user.email}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [partners, search]);

  const loading = loadingPartners || loadingContributions;
  const error = errorPartners || errorContributions;

  function refetchAll() {
    refetchPartners();
    refetchContributions();
  }

  function closePartnerModal() {
    setEditingPartner(null);
    setPartnerForm(initialPartnerForm);
    setIsPartnerModalOpen(false);
  }

  function openCreatePartnerModal() {
    setEditingPartner(null);
    setPartnerForm(initialPartnerForm);
    setIsPartnerModalOpen(true);
  }

  function openEditPartnerModal(partner: Partner) {
    setEditingPartner(partner);
    setPartnerForm({
      id: partner.id,
      boatId: partner.boatId,
      name: partner.user.name,
      email: partner.user.email,
      phone: maskPhone(partner.user.phone ?? ''),
      role: partner.role,
      participationPercent: String(partner.participationPercent),
      monthlyContribution: currencyToInputValue(partner.monthlyContribution),
      status: partner.status,
    });
    setIsPartnerModalOpen(true);
  }

  function openContributionPaymentModal(contribution: PartnerContribution) {
    setContributionToPay(contribution);
    setContributionPaymentForm({
      paidByUserId: contribution.paidByUserId ?? contribution.partnerUser?.id ?? '',
      paymentMethod: contribution.paymentMethod ?? '',
      notes: contribution.paymentNotes ?? '',
      paidAt: contribution.paidAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    });
  }

  function openContributionRefundModal(contribution: PartnerContribution) {
    setContributionToRefund(contribution);
    setContributionRefundForm({
      refundAmount: currencyToInputValue(contribution.amount),
      reason: contribution.refundReason ?? '',
      refundedAt: new Date().toISOString().slice(0, 10),
    });
  }

  async function handleSubmitPartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      boatId: partnerForm.boatId,
      role: partnerForm.role,
      status: partnerForm.status,
      participationPercent: Number(partnerForm.participationPercent) || 0,
      monthlyContribution: parseCurrencyInput(partnerForm.monthlyContribution),
      user: {
        name: partnerForm.name,
        email: partnerForm.email,
        phone: partnerForm.phone.replace(/\D/g, ''),
      },
    } as Partial<Partner>;

    try {
      if (editingPartner) {
        await partnerService.update(editingPartner.id, payload);
        toast.success('Sócio atualizado com sucesso.');
      } else {
        await partnerService.create(payload);
        toast.success('Sócio criado com sucesso.');
      }
      closePartnerModal();
      refetchAll();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Erro ao salvar sócio.'));
    }
  }

  async function handleDeactivatePartner() {
    if (!partnerToDeactivate) {
      return;
    }

    try {
      await partnerService.deactivate(partnerToDeactivate.id);
      setPartnerToDeactivate(null);
      refetchAll();
      toast.success('Sócio desativado com sucesso.');
    } catch (deactivateError) {
      toast.error(getErrorMessage(deactivateError, 'Erro ao desativar sócio.'));
    }
  }

  async function handlePayContribution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contributionToPay) {
      return;
    }

    try {
      await partnerService.payContribution(contributionToPay.id, {
        paidByUserId: contributionPaymentForm.paidByUserId || undefined,
        paymentMethod: contributionPaymentForm.paymentMethod || undefined,
        notes: contributionPaymentForm.notes || undefined,
        paidAt: contributionPaymentForm.paidAt ? `${contributionPaymentForm.paidAt}T00:00:00-03:00` : undefined,
      });
      setContributionToPay(null);
      setContributionPaymentForm(initialContributionPaymentForm);
      refetchAll();
      toast.success('Pagamento de contribuição registrado com sucesso.');
    } catch (paymentError) {
      toast.error(getErrorMessage(paymentError, 'Erro ao registrar pagamento da contribuição.'));
    }
  }

  async function handleRefundContribution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contributionToRefund) {
      return;
    }

    try {
      await partnerService.refundContribution(contributionToRefund.id, {
        refundAmount: parseCurrencyInput(contributionRefundForm.refundAmount),
        reason: contributionRefundForm.reason || undefined,
        refundedAt: contributionRefundForm.refundedAt ? `${contributionRefundForm.refundedAt}T00:00:00-03:00` : undefined,
      });
      setContributionToRefund(null);
      setContributionRefundForm(initialContributionRefundForm);
      refetchAll();
      toast.success('Reembolso de contribuição registrado com sucesso.');
    } catch (refundError) {
      toast.error(getErrorMessage(refundError, 'Erro ao registrar reembolso da contribuição.'));
    }
  }

  async function handleGenerateContributions() {
    try {
      await partnerService.generateContributions();
      refetchContributions();
      toast.success('Contribuições do mês geradas com sucesso.');
    } catch (generationError) {
      toast.error(getErrorMessage(generationError, 'Erro ao gerar contribuições.'));
    }
  }

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
        <Button variant="outline" onClick={refetchAll}>Tentar novamente</Button>
      </div>
    );
  }

  if (!canViewPartners) {
    return (
      <EmptyState
        icon={Users}
        title="Acesso restrito"
        description="Apenas administradores e sócios podem visualizar sócios e contribuições."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sócios</h1>
          <p className="text-muted-foreground">Gestão de parceiros, contatos e contribuições financeiras</p>
        </div>
        {canManagePartners && (
          <Button onClick={openCreatePartnerModal}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar sócio
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sócios ativos" value={String(ativos)} subtitle="participantes" icon={UserCheck} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Total sócios" value={String(partners.length)} subtitle="cadastrados" icon={Users} iconBgColor="bg-nautify-50" iconColor="text-nautify-700" />
        <StatCard title="Contribuições" value={formatCurrency(totalContrib)} subtitle="lançadas" icon={DollarSign} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Pendentes" value={formatCurrency(totalPending)} subtitle="a receber" icon={AlertCircle} iconBgColor="bg-amber-50" iconColor="text-amber-600" />
      </div>

      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setTab('socios')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'socios' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Sócios
        </button>
        <button onClick={() => setTab('contribuicoes')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'contribuicoes' ? 'border-nautify-600 text-nautify-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Contribuições
        </button>
      </div>

      {tab === 'socios' ? (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar sócio..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
          </div>

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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold truncate">{partner.user.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>{status.label}</span>
                          <Badge variant="outline">{roleLabels[partner.role]}</Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {partner.user.email}</span>
                          {partner.user.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {maskPhone(partner.user.phone)}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary"><Ship className="h-3 w-3 mr-1" /> {partner.boatName}</Badge>
                          <Badge variant="secondary"><Percent className="h-3 w-3 mr-1" /> {partner.participationPercent}%</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3 p-3 bg-muted/50 rounded-lg text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Mensalidade</p>
                            <p className="text-sm font-bold">{formatCurrency(partner.monthlyContribution)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total líquido</p>
                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(partner.totalContributed)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pendências</p>
                            <p className="text-sm font-bold">{partner.pendingPayments}</p>
                          </div>
                        </div>

                        {canManagePartners && (
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditPartnerModal(partner)}>Editar</Button>
                            {partner.status === 'ativo' && (
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600" onClick={() => setPartnerToDeactivate(partner)}>
                                <UserX className="h-3.5 w-3.5 mr-1" /> Desativar
                              </Button>
                            )}
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
        <>
          {canManagePartners && (
            <div className="flex justify-end">
              <Button onClick={handleGenerateContributions}>
                <DollarSign className="h-4 w-4 mr-2" /> Gerar contribuições do mês
              </Button>
            </div>
          )}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Sócio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Mês</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Quem pagou</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Método</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Pago em</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {contributions.map((contribution) => {
                      const status = contribStatusConfig[contribution.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={contribution.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{contribution.partnerUser?.name ?? '—'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{contribution.month}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold">{formatCurrency(contribution.amount)}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{contribution.paidByUser?.name ?? '—'}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{getPaymentMethodLabel(contribution.paymentMethod)}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{contribution.paidAt ? formatDate(contribution.paidAt) : '—'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                                <StatusIcon className="h-3 w-3" /> {status.label}
                              </span>
                              {contribution.refundStatus !== 'none' && (
                                <span className="text-xs font-medium text-amber-600">{getRefundStatusLabel(contribution.refundStatus)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {canManagePartners && contribution.status !== 'pago' && (
                                <Button variant="ghost" size="sm" onClick={() => openContributionPaymentModal(contribution)}>Receber</Button>
                              )}
                              {canManagePartners && contribution.status === 'pago' && contribution.refundStatus === 'none' && (
                                <Button variant="ghost" size="sm" onClick={() => openContributionRefundModal(contribution)}>Reembolsar</Button>
                              )}
                            </div>
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

      <Modal isOpen={isPartnerModalOpen} onClose={closePartnerModal} title={editingPartner ? 'Editar sócio' : 'Adicionar sócio'}>
        <form className="space-y-4" onSubmit={handleSubmitPartner}>
          <Input label="Nome completo" value={partnerForm.name} onChange={(event) => setPartnerForm((current) => ({ ...current, name: event.target.value }))} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="E-mail" type="email" value={partnerForm.email} onChange={(event) => setPartnerForm((current) => ({ ...current, email: event.target.value }))} required />
            <Input label="Telefone" value={partnerForm.phone} onChange={(event) => setPartnerForm((current) => ({ ...current, phone: maskPhone(event.target.value) }))} placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Embarcação" value={partnerForm.boatId} onChange={(event) => setPartnerForm((current) => ({ ...current, boatId: event.target.value }))} required>
              <option value="">Selecione...</option>
              {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </Select>
            <Select label="Perfil" value={partnerForm.role} onChange={(event) => setPartnerForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
              <option value="socio">Sócio</option>
              <option value="admin">Administrador</option>
              <option value="marinheiro">Marinheiro</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Participação (%)" type="number" min={0} max={100} value={partnerForm.participationPercent} onChange={(event) => setPartnerForm((current) => ({ ...current, participationPercent: event.target.value }))} required />
            <Input label="Mensalidade" value={partnerForm.monthlyContribution} onChange={(event) => setPartnerForm((current) => ({ ...current, monthlyContribution: formatCurrencyInput(event.target.value) }))} placeholder="R$ 0,00" required />
          </div>
          {editingPartner && (
            <Select label="Status" value={partnerForm.status} onChange={(event) => setPartnerForm((current) => ({ ...current, status: event.target.value as Partner['status'] }))}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="suspenso">Suspenso</option>
            </Select>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closePartnerModal}>Cancelar</Button>
            <Button type="submit">{editingPartner ? 'Salvar alterações' : 'Adicionar sócio'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={contributionToPay !== null} onClose={() => setContributionToPay(null)} title="Registrar pagamento da contribuição">
        <form className="space-y-4" onSubmit={handlePayContribution}>
          <Select label="Quem pagou" value={contributionPaymentForm.paidByUserId} onChange={(event) => setContributionPaymentForm((current) => ({ ...current, paidByUserId: event.target.value }))} required>
            <option value="">Selecione...</option>
            {boatSocios.map((member) => (
              <option key={member.user.id} value={member.user.id}>{member.user.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Método de pagamento" value={contributionPaymentForm.paymentMethod} onChange={(event) => setContributionPaymentForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethodSelection }))} required>
              <option value="">Selecione...</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <Input label="Data do pagamento" type="date" value={contributionPaymentForm.paidAt} onChange={(event) => setContributionPaymentForm((current) => ({ ...current, paidAt: event.target.value }))} />
          </div>
          <Textarea label="Observações" value={contributionPaymentForm.notes} onChange={(event) => setContributionPaymentForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setContributionToPay(null)}>Cancelar</Button>
            <Button type="submit">Confirmar pagamento</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={contributionToRefund !== null} onClose={() => setContributionToRefund(null)} title="Registrar reembolso da contribuição">
        <form className="space-y-4" onSubmit={handleRefundContribution}>
          <Input
            label="Valor do reembolso"
            value={contributionRefundForm.refundAmount}
            onChange={(event) => setContributionRefundForm((current) => ({ ...current, refundAmount: formatCurrencyInput(event.target.value) }))}
            required
          />
          <Input label="Data do reembolso" type="date" value={contributionRefundForm.refundedAt} onChange={(event) => setContributionRefundForm((current) => ({ ...current, refundedAt: event.target.value }))} />
          <Textarea label="Motivo" value={contributionRefundForm.reason} onChange={(event) => setContributionRefundForm((current) => ({ ...current, reason: event.target.value }))} rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setContributionToRefund(null)}>Cancelar</Button>
            <Button type="submit">Registrar reembolso</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={partnerToDeactivate !== null}
        onClose={() => setPartnerToDeactivate(null)}
        onConfirm={handleDeactivatePartner}
        title="Desativar sócio"
        description={partnerToDeactivate ? `O sócio "${partnerToDeactivate.user.name}" será marcado como inativo.` : undefined}
        confirmLabel="Desativar"
        variant="warning"
      />
    </div>
  );
}
