'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ship,
  Wrench,
  Users,
  Bell,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/errors';
import { useApi } from '@/hooks/useApi';
import { useHasAnyBoat } from '@/hooks/useBoatPermissions';
import { useBoats } from '@/hooks/useEntityOptions';
import { calendarService, tripService } from '@/services';
import type { CalendarEvent, Trip } from '@/types';

const eventTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CalendarDays }> = {
  reserva: { label: 'Reserva', color: 'bg-nautify-500', bgColor: 'bg-nautify-50 text-nautify-700 dark:bg-nautify-500/15 dark:text-nautify-300', icon: Ship },
  manutencao: { label: 'Manutencao', color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', icon: Wrench },
  lembrete: { label: 'Lembrete', color: 'bg-red-500', bgColor: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300', icon: Bell },
  evento: { label: 'Evento', color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300', icon: Users },
  outro: { label: 'Outro', color: 'bg-gray-500', bgColor: 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300', icon: CalendarDays },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmado: { label: 'Confirmado', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  pendente: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' },
};

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

function isEventOnDay(dateValue: string, year: number, month: number, day: number) {
  const date = new Date(dateValue);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

export default function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedEvents, setImportedEvents] = useState<Array<{ title: string; type: string; startDate: string; endDate: string; boatId: string; description: string }>>([]);
  const [importing, setImporting] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const canWrite = useHasAnyBoat();
  const toast = useToast();
  const { boats } = useBoats();
  const [filterType, setFilterType] = useState('');
  const [boatFilter, setBoatFilter] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const { data: events, loading, error, refetch } = useApi<CalendarEvent[]>(
    () => calendarService.list({ boatId: boatFilter || undefined }),
    [boatFilter],
  );
  const { data: trips, loading: tripsLoading, error: tripsError, refetch: refetchTrips } = useApi<Trip[]>(
    () => tripService.list({ boatId: boatFilter || undefined }),
    [boatFilter],
  );

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const tripEvents: CalendarEvent[] = (trips ?? [])
    .filter((trip) => !(events ?? []).some((event) => event.relatedTripId === trip.id))
    .map((trip) => ({
      id: `trip-${trip.id}`,
      boatId: trip.boatId,
      boatName: trip.boatName,
      title: `Saida - ${trip.boatName || 'Embarcacao'}`,
      description: trip.observations,
      type: 'reserva',
      status: trip.status === 'cancelada' ? 'cancelado' : trip.status === 'agendada' ? 'pendente' : 'confirmado',
      startDate: trip.startDate,
      endDate: trip.endDate || trip.startDate,
      allDay: false,
      createdByUserId: trip.responsibleUserId || '',
      relatedTripId: trip.id,
      createdAt: trip.createdAt,
    }));

  const allEvents = [...(events ?? []), ...tripEvents];
  const filteredEvents = filterType ? allEvents.filter((e) => e.type === filterType) : allEvents;

  const getEventsForDay = (day: number) =>
    filteredEvents.filter((e) => isEventOnDay(e.startDate, currentYear, currentMonth, day));

  const refetchAgenda = async () => {
    await Promise.all([refetch(), refetchTrips()]);
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await calendarService.create({
      title: formData.get('title') as string,
      type: formData.get('type') as CalendarEvent['type'],
      boatId: (formData.get('boatId') as string) || undefined,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      description: (formData.get('description') as string) || undefined,
    } as Partial<CalendarEvent>);
    setIsModalOpen(false);
    await refetchAgenda();
  };

  const handleCancelEvent = async (id: string) => {
    await calendarService.cancel(id);
    await refetchAgenda();
  };

  const handleDeleteEvent = async (id: string) => {
    await calendarService.delete(id);
    await refetchAgenda();
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
        })).filter((event) => event.title && event.startDate);

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
      const imported = importedEvents.map((event) => ({
        title: event.title,
        type: (event.type || 'evento') as CalendarEvent['type'],
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        boatId: event.boatId || undefined,
        description: event.description || undefined,
      }));
      const { data } = await calendarService.bulkCreate(imported);
      toast.success(`${data.created} eventos importados com sucesso!`);
      setImportedEvents([]);
      setIsImportModalOpen(false);
      await refetchAgenda();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao importar eventos'));
    } finally {
      setImporting(false);
    }
  };

  if (loading || tripsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-nautify-600" />
      </div>
    );
  }

  if (error || tripsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-600 font-medium">{error || tripsError}</p>
        <Button variant="outline" onClick={refetchAgenda}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Agendamentos, reservas e compromissos</p>
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
      <div className="flex flex-wrap gap-4">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? '' : type)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filterType === type ? `${config.bgColor} ring-2 ring-offset-1` : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
            {config.label}
          </button>
        ))}
      </div>

      {view === 'calendar' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <button onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <CardTitle>{monthNames[currentMonth]} {currentYear}</CardTitle>
            <button onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
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
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[9px] font-medium px-1 py-0.5 rounded truncate text-white ${eventTypeConfig[event.type]?.color || 'bg-gray-500'}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} mais</span>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 sm:hidden justify-center">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[event.type]?.color || 'bg-gray-500'}`} />
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
              {filteredEvents.map((event) => {
                const config = eventTypeConfig[event.type];
                const status = statusConfig[event.status];
                const Icon = config?.icon || CalendarDays;
                const canManageEvent = canWrite && !event.id.startsWith('trip-');
                return (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-1.5 h-10 sm:h-14 rounded-full shrink-0 ${config?.color || 'bg-gray-500'}`} />
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${config?.bgColor || 'bg-gray-50 dark:bg-gray-500/15 dark:text-gray-300'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.startDate).toLocaleDateString('pt-BR')} {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Ship className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{event.boatName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-[52px] sm:ml-0 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config?.bgColor}`}>{config?.label}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.color}`}>{status?.label}</span>
                      {canManageEvent && event.status === 'confirmado' && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-300 text-xs px-2" onClick={() => handleCancelEvent(event.id)}>
                          Cancelar
                        </Button>
                      )}
                      {canManageEvent && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600 dark:hover:text-red-300 text-xs px-2" onClick={() => handleDeleteEvent(event.id)}>
                          Excluir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Evento">
        <form className="space-y-4" onSubmit={handleCreateEvent}>
          <Input name="title" label="Titulo" placeholder="Ex: Saida Mar Azul" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo">
              <option value="reserva">Reserva</option>
              <option value="manutencao">Manutencao</option>
              <option value="lembrete">Lembrete</option>
              <option value="evento">Evento</option>
              <option value="outro">Outro</option>
            </Select>
            <Select name="boatId" label="Embarcacao">
              <option value="">Nenhuma</option>
              {boats.map((boat) => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="startDate" label="Inicio" type="datetime-local" required />
            <Input name="endDate" label="Fim" type="datetime-local" required />
          </div>
          <Textarea name="description" label="Descricao" placeholder="Detalhes do evento..." rows={3} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportedEvents([]); }} title="Importar Eventos de Planilha">
        <div className="space-y-4">
          {importedEvents.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Envie uma planilha (.xlsx ou .csv) com as colunas: Titulo, Tipo, Data Inicio, Data Fim, Embarcacao ID, Descricao
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
                <label htmlFor="import-file" className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-nautify-300 transition-colors cursor-pointer block">
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
