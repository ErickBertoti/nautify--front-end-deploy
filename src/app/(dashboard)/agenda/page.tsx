'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, Ship,
  Wrench, Loader2, AlertCircle, Upload, AlertTriangle, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { useApi } from '@/hooks/useApi';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { useBoats } from '@/hooks/useEntityOptions';
import { calendarService, maintenanceService } from '@/services';
import type { CalendarEvent, UnifiedCalendarEvent, CalendarEventKind } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Catálogo único de visualização por kind/subtype.
// Adicionar uma nova source (deliveries, reservations) significa só
// estender este record + adicionar a função correspondente no back-end.
type KindStyle = {
  label: string;
  color: string;      // bg-XXX-500 sólido para barrinhas/pílulas
  bgColor: string;    // bg-XXX-50 + text-XXX-700 para badges
  icon: typeof CalendarDays;
  href: (refId: string) => string;
};

const kindStyles: Record<CalendarEventKind, KindStyle> = {
  maintenance: {
    label: 'Manutencao',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    icon: Wrench,
    href: () => '/manutencao',
  },
  trip: {
    label: 'Saida',
    color: 'bg-nautify-500',
    bgColor: 'bg-nautify-50 text-nautify-700 dark:bg-nautify-500/15 dark:text-nautify-300',
    icon: Ship,
    href: () => '/saidas',
  },
  event: {
    label: 'Evento',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    icon: CalendarDays,
    href: () => '/agenda',
  },
};

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

function isOnDay(iso: string, year: number, month: number, day: number) {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

function isMaintOverdue(ev: UnifiedCalendarEvent) {
  return ev.kind === 'maintenance' && Boolean(ev.meta?.overdue);
}

export default function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selected, setSelected] = useState<UnifiedCalendarEvent | null>(null);
  const [importedEvents, setImportedEvents] = useState<Array<{ title: string; type: string; startDate: string; endDate: string; boatId: string; description: string }>>([]);
  const [importing, setImporting] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const canWrite = useHasAnyBoat();
  const toast = useToast();
  const { boats } = useBoats();
  const [kindFilter, setKindFilter] = useState<CalendarEventKind | ''>('');
  const [boatFilter, setBoatFilter] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const calendarDays = getCalendarDays(currentYear, currentMonth);

  const range = useMemo(() => {
    const from = new Date(currentYear, currentMonth - 1, 1).toISOString();
    const to = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59).toISOString();
    return { from, to };
  }, [currentYear, currentMonth]);

  const { data: events, loading, error, refetch } = useApi<UnifiedCalendarEvent[]>(
    () => calendarService.getUnified({
      from: range.from,
      to: range.to,
      boatId: boatFilter || undefined,
    }),
    [range.from, range.to, boatFilter],
  );

  const allEvents = events ?? [];
  const filtered = kindFilter ? allEvents.filter((e) => e.kind === kindFilter) : allEvents;

  const eventsForDay = (day: number) =>
    filtered.filter((e) => isOnDay(e.start, currentYear, currentMonth, day));

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const boatId = (formData.get('boatId') as string).trim();
    if (!boatId) {
      toast.warning('Selecione uma embarcacao');
      return;
    }
    try {
      await calendarService.create({
        title: formData.get('title') as string,
        type: formData.get('type') as CalendarEvent['type'],
        boatId,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        description: (formData.get('description') as string) || undefined,
      } as Partial<CalendarEvent>);
      toast.success('Evento criado');
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao criar evento'));
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

        const parsed = rows.map((row) => ({
          title: row['Titulo'] || row['titulo'] || row['title'] || '',
          type: (row['Tipo'] || row['tipo'] || row['type'] || 'evento').toLowerCase(),
          startDate: row['Data Inicio'] || row['data_inicio'] || row['startDate'] || '',
          endDate: row['Data Fim'] || row['data_fim'] || row['endDate'] || '',
          boatId: row['Embarcacao ID'] || row['boatId'] || '',
          description: row['Descricao'] || row['descricao'] || row['description'] || '',
        })).filter((ev) => ev.title && ev.startDate && ev.boatId);

        setImportedEvents(parsed);
      } catch {
        toast.error('Erro ao ler planilha');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    try {
      setImporting(true);
      const imported = importedEvents.map((ev) => ({
        title: ev.title,
        type: (ev.type || 'evento') as CalendarEvent['type'],
        startDate: ev.startDate,
        endDate: ev.endDate || ev.startDate,
        boatId: ev.boatId,
        description: ev.description || undefined,
      }));
      const { data } = await calendarService.bulkCreate(imported);
      toast.success(`${data.created} eventos importados`);
      setImportedEvents([]);
      setIsImportModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao importar eventos'));
    } finally {
      setImporting(false);
    }
  };

  const handleQuickComplete = async (ev: UnifiedCalendarEvent) => {
    if (ev.kind !== 'maintenance') return;
    // Atalho usa custo estimado como custo real default e a data de hoje.
    // Para casos finos, o usuário deve usar a página de manutenção.
    const estimated = Number(ev.meta?.estimatedCost) || 0;
    if (!confirm(`Concluir manutencao "${ev.title}" com custo real igual ao estimado (${formatCurrency(estimated)}) e data de hoje?`)) return;
    try {
      await maintenanceService.complete(ev.refId, {
        actualCost: estimated,
        completedDate: new Date().toISOString(),
      });
      toast.success('Manutencao concluida');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao concluir manutencao'));
    }
  };

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
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Manutencoes, saidas e eventos — agregados automaticamente</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${view === 'calendar' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
            >
              Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${view === 'list' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
            >
              Lista
            </button>
          </div>
          {canWrite && (
            <>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" /> Importar
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Novo Evento
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Select value={boatFilter} onChange={(e) => setBoatFilter(e.target.value)}>
          <option value="">Todas embarcacoes</option>
          {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
        </Select>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(kindStyles) as Array<[CalendarEventKind, KindStyle]>).map(([kind, cfg]) => (
          <button
            key={kind}
            onClick={() => setKindFilter(kindFilter === kind ? '' : kind)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${kindFilter === kind ? `${cfg.bgColor} ring-2 ring-offset-1` : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
            {cfg.label}
          </button>
        ))}
      </div>

      {view === 'calendar' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <button
              onClick={() => setViewDate((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <CardTitle>{monthNames[currentMonth]} {currentYear}</CardTitle>
            <button
              onClick={() => setViewDate((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day, idx) => {
                const dayEvents = day ? eventsForDay(day) : [];
                const today = new Date();
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                return (
                  <div
                    key={idx}
                    className={`min-h-[48px] sm:min-h-[80px] p-0.5 sm:p-1 border border-border/50 rounded transition-colors ${day ? 'hover:bg-muted/50' : 'bg-muted/20'} ${isToday ? 'bg-nautify-50/50 border-nautify-200 dark:bg-nautify-500/10 dark:border-nautify-500/30' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-nautify-600 dark:text-nautify-300 font-bold' : 'text-muted-foreground'}`}>
                          {day}
                        </span>
                        <div className="space-y-0.5 mt-0.5 hidden sm:block">
                          {dayEvents.slice(0, 2).map((ev) => {
                            const overdue = isMaintOverdue(ev);
                            return (
                              <button
                                key={ev.id}
                                onClick={() => setSelected(ev)}
                                title={`${ev.title}\n${ev.boatName ?? ''}\n${new Date(ev.start).toLocaleString('pt-BR')}`}
                                className={`block w-full text-left text-[9px] font-medium px-1 py-0.5 rounded truncate text-white ${kindStyles[ev.kind].color} ${overdue ? 'ring-1 ring-red-400' : ''} hover:opacity-90 transition-opacity cursor-pointer`}
                              >
                                {overdue && '⚠ '}{ev.title}
                              </button>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} mais</span>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 sm:hidden justify-center">
                            {dayEvents.slice(0, 3).map((ev) => (
                              <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${kindStyles[ev.kind].color}`} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((ev) => {
                const cfg = kindStyles[ev.kind];
                const Icon = cfg.icon;
                const overdue = isMaintOverdue(ev);
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelected(ev)}
                    className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-1.5 h-10 sm:h-14 rounded-full shrink-0 ${cfg.color} ${overdue ? 'ring-2 ring-red-400' : ''}`} />
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${cfg.bgColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate flex items-center gap-2">
                          {ev.title}
                          {overdue && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                              <AlertTriangle className="h-3 w-3" /> Atrasada
                            </span>
                          )}
                        </p>
                        {ev.subtitle && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{ev.subtitle}</p>
                        )}
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(ev.start).toLocaleDateString('pt-BR')} {!ev.allDay && new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {ev.boatName && (
                            <div className="flex items-center gap-1">
                              <Ship className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{ev.boatName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-[52px] sm:ml-0 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bgColor}`}>{cfg.label}</span>
                      {ev.status && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground capitalize">
                          {ev.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes do evento */}
      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title={selected.title}>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${kindStyles[selected.kind].bgColor}`}>
                {kindStyles[selected.kind].label}
              </span>
              {selected.status && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground capitalize">
                  {selected.status.replace(/_/g, ' ')}
                </span>
              )}
              {isMaintOverdue(selected) && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3" /> Atrasada
                </span>
              )}
            </div>
            {selected.subtitle && <p className="text-muted-foreground">{selected.subtitle}</p>}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Inicio</p>
                <p className="font-medium">{new Date(selected.start).toLocaleString('pt-BR')}</p>
              </div>
              {selected.end && (
                <div>
                  <p className="text-xs text-muted-foreground">Fim</p>
                  <p className="font-medium">{new Date(selected.end).toLocaleString('pt-BR')}</p>
                </div>
              )}
              {selected.boatName && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Embarcacao</p>
                  <p className="font-medium">{selected.boatName}</p>
                </div>
              )}
              {selected.kind === 'maintenance' && typeof selected.meta?.estimatedCost === 'number' && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Custo estimado</p>
                  <p className="font-medium">{formatCurrency(selected.meta.estimatedCost as number)}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Link
                href={kindStyles[selected.kind].href(selected.refId)}
                className="flex-1"
                onClick={() => setSelected(null)}
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Abrir modulo
                </Button>
              </Link>
              {selected.kind === 'maintenance' && selected.status !== 'concluida' && selected.status !== 'cancelada' && canWrite && (
                <Button className="flex-1" onClick={() => { handleQuickComplete(selected); setSelected(null); }}>
                  Concluir rapido
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Criar evento manual (lembretes, reservas avulsas) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Evento">
        <form className="space-y-4" onSubmit={handleCreateEvent}>
          <p className="text-xs text-muted-foreground">
            Manutencoes e saidas aparecem automaticamente — use este formulario apenas para lembretes,
            reservas avulsas ou compromissos.
          </p>
          <Input name="title" label="Titulo" placeholder="Ex: Visita do mecanico" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo">
              <option value="reserva">Reserva</option>
              <option value="lembrete">Lembrete</option>
              <option value="evento">Evento</option>
              <option value="outro">Outro</option>
            </Select>
            <Select name="boatId" label="Embarcacao" required>
              <option value="">Selecione...</option>
              {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="startDate" label="Inicio" type="datetime-local" required />
            <Input name="endDate" label="Fim" type="datetime-local" required />
          </div>
          <Textarea name="description" label="Descricao" placeholder="Detalhes..." rows={3} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportedEvents([]); }} title="Importar Eventos">
        <div className="space-y-4">
          {importedEvents.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Envie uma planilha (.xlsx ou .csv) com as colunas: Titulo, Tipo, Data Inicio, Data Fim, Embarcacao ID, Descricao.
              </p>
              <div>
                <input
                  type="file"
                  accept=".xlsx,.csv,.xls"
                  className="hidden"
                  id="import-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                  }}
                />
                <label
                  htmlFor="import-file"
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-nautify-300 transition-colors cursor-pointer block"
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Clique para selecionar arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx, .csv</p>
                </label>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">{importedEvents.length} eventos encontrados</p>
              <div className="max-h-64 overflow-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-3 py-2">Titulo</th>
                      <th className="text-left px-3 py-2">Tipo</th>
                      <th className="text-left px-3 py-2">Inicio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedEvents.slice(0, 50).map((event, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-2">{event.title}</td>
                        <td className="px-3 py-2">{event.type}</td>
                        <td className="px-3 py-2">{event.startDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setImportedEvents([])}>Voltar</Button>
                <Button className="flex-1" onClick={handleConfirmImport} disabled={importing}>
                  {importing ? 'Importando...' : `Importar ${importedEvents.length} eventos`}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
