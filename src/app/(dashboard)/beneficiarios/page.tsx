'use client';

import React, { useState } from 'react';
import {
  UserCog, Plus, Search, Loader2, AlertCircle, Pencil, Power, Trash2,
  Ship, Mail, Phone, Wallet, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { beneficiaryService } from '@/services';
import { getErrorMessage } from '@/lib/errors';
import type { Beneficiary, BeneficiaryType, PaginatedResponse } from '@/types';

const typeLabels: Record<BeneficiaryType, string> = {
  marinheiro: 'Marinheiro',
  mecanico: 'Mecânico',
  fornecedor: 'Fornecedor',
  prestador_servico: 'Prestador de Serviço',
  proprietario: 'Proprietário',
  socio: 'Sócio',
  parceiro_agencia: 'Parceiro/Agência',
  outro: 'Outro',
};

const typeColors: Record<BeneficiaryType, string> = {
  marinheiro:        'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  mecanico:          'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  fornecedor:        'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  prestador_servico: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  proprietario:      'bg-nautify-50 text-nautify-700 dark:bg-nautify-500/15 dark:text-nautify-300',
  socio:             'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  parceiro_agencia:  'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  outro:             'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300',
};

export default function BeneficiariosPage() {
  const toast = useToast();
  const { boats } = useBoats();
  const canWrite = useHasAnyBoat();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBoat, setFilterBoat] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => beneficiaryService.list({
      type: filterType || undefined,
      boatId: filterBoat || undefined,
      q: search || undefined,
      active: showInactive ? undefined : true,
      limit: 200,
    }),
    [filterType, filterBoat, search, showInactive],
  );

  const paginated = data as PaginatedResponse<Beneficiary> | null;
  const beneficiaries = paginated?.data ?? [];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, target?: Beneficiary) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      type: form.get('type') as BeneficiaryType,
      boatId: (form.get('boatId') as string) || null,
      document: String(form.get('document') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('email') || ''),
      pixKey: String(form.get('pixKey') || ''),
      notes: String(form.get('notes') || ''),
      active: target ? target.active : true,
    };
    setSaving(true);
    try {
      if (target) {
        await beneficiaryService.update(target.id, payload);
        toast.success('Beneficiário atualizado');
      } else {
        await beneficiaryService.create(payload);
        toast.success('Beneficiário criado');
      }
      setEditing(null);
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (b: Beneficiary) => {
    try {
      if (b.active) {
        await beneficiaryService.deactivate(b.id);
        toast.success('Beneficiário inativado');
      } else {
        await beneficiaryService.update(b.id, {
          name: b.name,
          type: b.type,
          boatId: b.boatId ?? null,
          document: b.document,
          phone: b.phone,
          email: b.email,
          pixKey: b.pixKey,
          notes: b.notes,
          active: true,
        });
        toast.success('Beneficiário reativado');
      }
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao alterar status'));
    }
  };

  const handleDelete = async (b: Beneficiary) => {
    if (!confirm(`Excluir "${b.name}"? Se houver lançamentos vinculados, será apenas inativado.`)) return;
    try {
      await beneficiaryService.delete(b.id);
      toast.success('Removido');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover'));
    }
  };

  if (loading && beneficiaries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Beneficiários</h1>
          <p className="text-muted-foreground">Prestadores, fornecedores, marinheiros, sócios e parceiros da frota</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Beneficiário
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos os tipos</option>
              {(Object.entries(typeLabels) as [BeneficiaryType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select value={filterBoat} onChange={(e) => setFilterBoat(e.target.value)}>
              <option value="">Todas embarcações</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Mostrar inativos
            </label>
          </div>
        </CardContent>
      </Card>

      {beneficiaries.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Nenhum beneficiário"
          description="Cadastre prestadores, fornecedores ou sócios para usar em pagamentos e manutenções."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {beneficiaries.map((b) => (
            <Card key={b.id} className={`${!b.active ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">{b.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1 ${typeColors[b.type]}`}>
                      {typeLabels[b.type]}
                    </span>
                  </div>
                  {!b.active && <Badge variant="outline">Inativo</Badge>}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {b.document && (
                    <div className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {b.document}</div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {b.phone}</div>
                  )}
                  {b.email && (
                    <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {b.email}</div>
                  )}
                  {b.pixKey && (
                    <div className="flex items-center gap-1.5 truncate"><Wallet className="h-3 w-3" /> {b.pixKey}</div>
                  )}
                  {b.boatName ? (
                    <div className="flex items-center gap-1.5"><Ship className="h-3 w-3" /> {b.boatName}</div>
                  ) : (
                    <div className="flex items-center gap-1.5"><Ship className="h-3 w-3" /> Global (qualquer embarcação)</div>
                  )}
                </div>

                {b.notes && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-2">{b.notes}</p>
                )}

                {canWrite && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(b)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(b)}
                      title={b.active ? 'Inativar' : 'Reativar'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(b)} title="Excluir">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(isCreateOpen || editing) && (
        <Modal
          isOpen
          onClose={() => { setEditing(null); setIsCreateOpen(false); }}
          title={editing ? 'Editar Beneficiário' : 'Novo Beneficiário'}
        >
          <form className="space-y-4" onSubmit={(e) => handleSave(e, editing ?? undefined)}>
            <Input name="name" label="Nome" defaultValue={editing?.name ?? ''} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select name="type" label="Tipo" defaultValue={editing?.type ?? 'prestador_servico'}>
                {(Object.entries(typeLabels) as [BeneficiaryType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <Select name="boatId" label="Embarcação" defaultValue={editing?.boatId ?? ''}>
                <option value="">Global (qualquer embarcação)</option>
                {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="document" label="CPF/CNPJ" defaultValue={editing?.document ?? ''} />
              <Input name="phone" label="Telefone" defaultValue={editing?.phone ?? ''} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="email" label="E-mail" type="email" defaultValue={editing?.email ?? ''} />
              <Input name="pixKey" label="Chave PIX" defaultValue={editing?.pixKey ?? ''} />
            </div>
            <Textarea name="notes" label="Observações" rows={2} defaultValue={editing?.notes ?? ''} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setEditing(null); setIsCreateOpen(false); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
