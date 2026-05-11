'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { maintenancePartsService, beneficiaryService } from '@/services';
import { getErrorMessage } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { MaintenancePart, MaintenancePartPayload, Beneficiary } from '@/types';

interface Props {
  maintenanceId: string;
  maintenanceTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MaintenancePartsModal({ maintenanceId, maintenanceTitle, isOpen, onClose }: Props) {
  const toast = useToast();
  const [parts, setParts] = useState<MaintenancePart[]>([]);
  const [suppliers, setSuppliers] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MaintenancePart | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalCost = parts.reduce((s, p) => s + p.totalCost, 0);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: partsData }, bensResp] = await Promise.all([
        maintenancePartsService.list(maintenanceId),
        beneficiaryService.list({ active: true, limit: 200 }),
      ]);
      setParts(partsData ?? []);
      setSuppliers(bensResp.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar peças'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, maintenanceId]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: MaintenancePartPayload = {
      name: String(form.get('name') || ''),
      quantity: Number(form.get('quantity')) || 1,
      unitCost: Number(form.get('unitCost')) || 0,
      replacedAt: form.get('replacedAt') ? new Date(String(form.get('replacedAt'))).toISOString() : null,
      supplierId: (form.get('supplierId') as string) || null,
      notes: String(form.get('notes') || '') || undefined,
    };
    if (!payload.name.trim()) {
      toast.warning('Nome da peça obrigatório');
      return;
    }
    if (payload.quantity <= 0) {
      toast.warning('Quantidade deve ser > 0');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await maintenancePartsService.update(editing.id, payload);
        toast.success('Peça atualizada');
      } else {
        await maintenancePartsService.create(maintenanceId, payload);
        toast.success('Peça adicionada');
      }
      setEditing(null);
      setIsFormOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar peça'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: MaintenancePart) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    try {
      await maintenancePartsService.delete(p.id);
      toast.success('Peça removida');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Peças — ${maintenanceTitle}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Total:</span>{' '}
            <span className="font-semibold">{formatCurrency(totalCost)}</span>
            <span className="ml-3 text-xs text-muted-foreground">({parts.length} peças)</span>
          </div>
          <Button size="sm" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <Package className="h-8 w-8" />
            <p className="text-sm">Nenhuma peça registrada nesta manutenção.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {parts.map((p) => (
              <li key={p.id} className="flex items-start gap-3 px-3 py-3">
                <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.quantity}x {formatCurrency(p.unitCost)} ={' '}
                    <span className="font-medium">{formatCurrency(p.totalCost)}</span>
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-0.5">
                    {p.supplierName && <span>Fornecedor: {p.supplierName}</span>}
                    {p.replacedAt && <span>Trocada em: {formatDate(p.replacedAt)}</span>}
                  </div>
                  {p.notes && <p className="text-xs text-muted-foreground italic mt-1">{p.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setIsFormOpen(true); }} title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} title="Remover">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {isFormOpen && (
          <form className="space-y-3 border-t border-border pt-4" onSubmit={handleSave}>
            <Input name="name" label="Nome da peça *" defaultValue={editing?.name ?? ''} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input name="quantity" label="Quantidade *" type="number" min="1" defaultValue={editing?.quantity ?? 1} required />
              <Input name="unitCost" label="Custo unitário (R$)" type="number" step="0.01" min="0" defaultValue={editing?.unitCost ?? 0} />
              <Input name="replacedAt" label="Trocada em" type="date" defaultValue={editing?.replacedAt?.slice(0, 10) ?? ''} />
            </div>
            <Select name="supplierId" label="Fornecedor" defaultValue={editing?.supplierId ?? ''}>
              <option value="">Sem fornecedor</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Textarea name="notes" label="Observações" rows={2} defaultValue={editing?.notes ?? ''} />
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setEditing(null); setIsFormOpen(false); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
