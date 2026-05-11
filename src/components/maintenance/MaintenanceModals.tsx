'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { maintenanceService } from '@/services';
import type { Maintenance, MaintenanceType, MaintenancePriority, MaintenanceStatus } from '@/types';

interface BoatOption {
  id: string;
  name: string;
}

// ── Edit modal ───────────────────────────────────────────
// Edita campos da manutenção sem permitir transição para `concluida`
// (essa rota usa o complete modal abaixo, que coleta dados obrigatórios).

interface EditProps {
  maintenance: Maintenance;
  boats: BoatOption[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function MaintenanceEditModal({ maintenance, boats, isOpen, onClose, onSaved }: EditProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await maintenanceService.update(maintenance.id, {
        ...maintenance,
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        type: formData.get('type') as MaintenanceType,
        priority: formData.get('priority') as MaintenancePriority,
        status: formData.get('status') as MaintenanceStatus,
        boatId: String(formData.get('boatId') || ''),
        scheduledDate: String(formData.get('scheduledDate') || ''),
        estimatedCost: Number(formData.get('estimatedCost')) || 0,
        notes: String(formData.get('notes') || ''),
      });
      toast.success('Manutencao atualizada');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar manutencao'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Manutencao">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="title" label="Titulo" defaultValue={maintenance.title} required />
        <Textarea name="description" label="Descricao" rows={3} defaultValue={maintenance.description} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select name="type" label="Tipo" defaultValue={maintenance.type}>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
          </Select>
          <Select name="priority" label="Prioridade" defaultValue={maintenance.priority}>
            <option value="baixa">Baixa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select name="boatId" label="Embarcacao" defaultValue={maintenance.boatId}>
            {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <Select name="status" label="Status" defaultValue={maintenance.status}>
            <option value="agendada">Pendente</option>
            <option value="em_andamento">Em andamento</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="scheduledDate"
            label="Data Agendada"
            type="date"
            defaultValue={maintenance.scheduledDate?.slice(0, 10)}
            required
          />
          <Input
            name="estimatedCost"
            label="Custo Estimado (R$)"
            type="number"
            step="0.01"
            defaultValue={maintenance.estimatedCost}
          />
        </div>
        <Textarea name="notes" label="Observacoes" rows={2} defaultValue={maintenance.notes} />
        <p className="text-xs text-muted-foreground">
          Para concluir a manutencao, feche e use o botao &quot;Concluir&quot;: custo real e data de conclusao sao obrigatorios.
        </p>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Complete modal ──────────────────────────────────────
// Conclui a manutenção. Custo real e data são obrigatórios (validação no
// cliente + 422 no back-end + CHECK constraint no DB).

interface CompleteProps {
  maintenance: Maintenance;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export function MaintenanceCompleteModal({ maintenance, isOpen, onClose, onCompleted }: CompleteProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [actualCost, setActualCost] = useState<number>(maintenance.actualCost ?? maintenance.estimatedCost);

  const diff = actualCost - maintenance.estimatedCost;
  const diffSign = diff > 0 ? '+' : '';
  const diffClass = diff > 0
    ? 'text-red-600 dark:text-red-300'
    : diff < 0
      ? 'text-emerald-600 dark:text-emerald-300'
      : 'text-muted-foreground';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const completedDate = String(formData.get('completedDate') || '');
    const completionNotes = String(formData.get('completionNotes') || '');

    if (!Number.isFinite(actualCost) || actualCost < 0) {
      toast.warning('Informe o custo real');
      return;
    }
    if (!completedDate) {
      toast.warning('Informe a data de conclusao');
      return;
    }

    setSaving(true);
    try {
      await maintenanceService.complete(maintenance.id, {
        actualCost,
        completedDate: new Date(completedDate).toISOString(),
        completionNotes: completionNotes || undefined,
      });
      toast.success('Manutencao concluida');
      onCompleted();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao concluir manutencao'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Concluir Manutencao">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <p className="font-medium">{maintenance.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimado: R$ {maintenance.estimatedCost.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div>
          <Input
            name="actualCost"
            label="Custo Real (R$) *"
            type="number"
            step="0.01"
            min="0"
            required
            value={Number.isFinite(actualCost) ? actualCost : ''}
            onChange={(e) => setActualCost(Number(e.target.value))}
          />
          <p className={`text-xs mt-1 ${diffClass}`}>
            Diferenca: {diffSign}R$ {diff.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <Input
          name="completedDate"
          label="Data de Conclusao *"
          type="date"
          required
          defaultValue={today}
          max={today}
        />
        <Textarea
          name="completionNotes"
          label="Observacoes Finais"
          rows={3}
          placeholder="O que foi feito, pecas trocadas, proximos passos..."
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Concluindo...' : 'Concluir Manutencao'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
