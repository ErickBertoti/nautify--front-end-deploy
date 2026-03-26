'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useBoats } from '@/hooks/useEntityOptions';
import { calendarService } from '@/services';
import type { CalendarEvent } from '@/types';

const eventTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof CalendarDays }> = {
  reserva: { label: 'Reserva', color: 'bg-nautify-500', bgColor: 'bg-nautify-50 text-nautify-700', icon: Ship },
  manutencao: { label: 'Manutenção', color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-700', icon: Wrench },
  lembrete: { label: 'Lembrete', color: 'bg-red-500', bgColor: 'bg-red-50 text-red-700', icon: Bell },
  evento: { label: 'Evento', color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-700', icon: Users },
  outro: { label: 'Outro', color: 'bg-gray-500', bgColor: 'bg-gray-50 text-gray-700', icon: CalendarDays },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmado: { label: 'Confirmado', color: 'bg-emerald-50 text-emerald-700' },
  pendente: { label: 'Pendente', color: 'bg-amber-50 text-amber-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-50 text-red-700' },
};

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const { boats } = useBoats();
  const [currentYear] = useState(2026);
  const [filterType, setFilterType] = useState('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const { data: events, loading, error, refetch } = useApi<CalendarEvent[]>(
    () => calendarService.list(),
    [],
  );

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const allEvents = events ?? [];

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter((e) => e.startDate.startsWith(dateStr));
  };

  const filteredEvents = filterType ? allEvents.filter((e) => e.type === filterType) : allEvents;

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
    refetch();
  };

  const handleCancelEvent = async (id: string) => {
    await calendarService.cancel(id);
    refetch();
  };

  const handleDeleteEvent = async (id: string) => {
    await calendarService.delete(id);
    refetch();
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
          <p className="text-muted-foreground">Agendamentos, reservas e compromissos</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${view === 'calendar' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
            >
              Calendário
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${view === 'list' ? 'bg-nautify-600 text-white' : 'hover:bg-muted'}`}
            >
              Lista
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Evento
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? '' : type)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filterType === type ? config.bgColor + ' ring-2 ring-offset-1' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
            {config.label}
          </button>
        ))}
      </div>

      {view === 'calendar' ? (
        /* Calendar View */
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <button onClick={() => setCurrentMonth((m) => m === 0 ? 11 : m - 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <CardTitle>{monthNames[currentMonth]} {currentYear}</CardTitle>
            <button onClick={() => setCurrentMonth((m) => m === 11 ? 0 : m + 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day, idx) => {
                const events = day ? getEventsForDay(day) : [];
                const today = new Date();
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                return (
                  <div
                    key={idx}
                    className={`min-h-[48px] sm:min-h-[80px] p-0.5 sm:p-1 border border-border/50 rounded transition-colors ${day ? 'hover:bg-muted/50' : 'bg-muted/20'
                      } ${isToday ? 'bg-nautify-50/50 border-nautify-200' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-nautify-600 font-bold' : 'text-muted-foreground'}`}>
                          {day}
                        </span>
                        <div className="space-y-0.5 mt-0.5 hidden sm:block">
                          {events.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[9px] font-medium px-1 py-0.5 rounded truncate text-white ${eventTypeConfig[event.type]?.color || 'bg-gray-500'}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <span className="text-[9px] text-muted-foreground px-1">+{events.length - 2} mais</span>
                          )}
                        </div>
                        {/* Mobile: just dots */}
                        {events.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 sm:hidden justify-center">
                            {events.slice(0, 3).map((event) => (
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
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredEvents.map((event) => {
                const config = eventTypeConfig[event.type];
                const status = statusConfig[event.status];
                const Icon = config?.icon || CalendarDays;
                return (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-1.5 h-10 sm:h-14 rounded-full shrink-0 ${config?.color || 'bg-gray-500'}`} />
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${config?.bgColor || 'bg-gray-50'}`}>
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
                      {event.status === 'confirmado' && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-amber-600 text-xs px-2" onClick={() => handleCancelEvent(event.id)}>
                          Cancelar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600 text-xs px-2" onClick={() => handleDeleteEvent(event.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Evento">
        <form className="space-y-4" onSubmit={handleCreateEvent}>
          <Input name="title" label="Título" placeholder="Ex: Saída Mar Azul" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tipo">
              <option value="reserva">Reserva</option>
              <option value="manutencao">Manutenção</option>
              <option value="lembrete">Lembrete</option>
              <option value="evento">Evento</option>
              <option value="outro">Outro</option>
            </Select>
            <Select name="boatId" label="Embarcação">
              <option value="">Nenhuma</option>
              {boats.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="startDate" label="Início" type="datetime-local" required />
            <Input name="endDate" label="Fim" type="datetime-local" required />
          </div>
          <Textarea name="description" label="Descrição" placeholder="Detalhes do evento..." rows={3} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
