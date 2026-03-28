'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship,
  ChevronRight,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Users,
  Receipt,
  Navigation,
  Wrench,
  AlertTriangle,
  Loader2,
  FileText,
  Clock,
  Plus,
  Camera,
} from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useCanWrite } from '@/hooks/useCanWrite';
import { boatService, expenseService, tripService, incidentService } from '@/services';
import type { Boat, BoatMember, Expense, Trip, Incident } from '@/types';
import { BOAT_TYPE_LABELS } from '@/constants';

export default function BoatDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const boatId = (params.id as string) || '';
  
  const canWrite = useCanWrite();
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'financeiro' | 'historico'>('visao_geral');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editImage, setEditImage] = useState<File | null>(null);

  // Load Main Boat
  const { data: boat, loading: loadingBoat, error: errorBoat, refetch: refetchBoat } = useApi<Boat>(
    () => boatService.getById(boatId),
    [boatId]
  );

  // Load Recent Data
  const { data: expensesData, loading: loadingExpenses } = useApi(
    () => expenseService.list({ boatId, limit: 5 }),
    [boatId]
  );
  
  const { data: tripsData, loading: loadingTrips } = useApi(
    () => tripService.list({ boatId, limit: 5 }),
    [boatId]
  );

  const { data: incidentsData, loading: loadingIncidents } = useApi(
    () => incidentService.list({ boatId, limit: 5 }),
    [boatId]
  );

  const expenses = expensesData || [];
  const trips = tripsData || [];
  const incidents = incidentsData || [];

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      let imageUrl: string | undefined;
      if (editImage) {
        const { url } = await uploadFile('boats', editImage);
        imageUrl = url;
      }
      await boatService.update(boatId, {
        name: fd.get('name') as string,
        type: fd.get('type') as Boat['type'],
        model: (fd.get('model') as string) || undefined,
        year: fd.get('year') ? Number(fd.get('year')) : undefined,
        registrationNumber: (fd.get('registrationNumber') as string) || undefined,
        marinaName: (fd.get('marinaName') as string) || undefined,
        marinaLocation: (fd.get('marinaLocation') as string) || undefined,
        ...(imageUrl ? { imageUrl } : {}),
      });
      setShowEditModal(false);
      setEditImage(null);
      refetchBoat();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await boatService.delete(boatId);
      router.push('/embarcacoes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await boatService.addMember(boatId, {
        userId: fd.get('userId') as string,
        role: fd.get('role') as string,
      });
      setShowAddMemberModal(false);
      refetchBoat();
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingBoat) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-nautify-600" />
      </div>
    );
  }

  if (errorBoat || !boat) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-destructive font-medium">{errorBoat || 'Embarcação não encontrada'}</p>
        <Button variant="outline" onClick={() => router.push('/embarcacoes')}>Voltar para Embarcações</Button>
      </div>
    );
  }

  const activeMembers = boat.members?.filter(m => m.isActive && m.role !== 'marinheiro') || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/embarcacoes" className="hover:text-foreground transition-colors cursor-pointer">
          Embarcações
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate">{boat.name}</span>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="absolute inset-0 h-40 overflow-hidden">
          {boat.imageUrl ? (
            <img src={boat.imageUrl} alt={boat.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-nautify-800 via-nautify-700 to-nautify-600">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                  <path d="M0 80 Q100 30 200 80 T400 80" fill="none" stroke="white" strokeWidth="2" />
                  <path d="M0 120 Q100 70 200 120 T400 120" fill="none" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative z-10 pt-28 px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          <div className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white shadow-xl border-4 border-card shrink-0">
             <Ship className="h-12 w-12 sm:h-16 sm:w-16 text-nautify-700" />
          </div>
          
          <div className="flex-1 space-y-2 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground !font-heading tracking-tight">{boat.name}</h1>
              <Badge className="bg-nautify-100 text-nautify-800 dark:bg-nautify-500/20 dark:text-nautify-300 hover:bg-nautify-200 border-0">
                {BOAT_TYPE_LABELS[boat.type] || boat.type}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mt-2">
              {boat.model && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-semibold text-foreground/80">Modelo:</span> {boat.model} {boat.year && `(${boat.year})`}
                </span>
              )}
              {boat.registrationNumber && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-semibold text-foreground/80">Reg:</span> {boat.registrationNumber}
                </span>
              )}
              {boat.marinaName && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-nautify-500" />
                  {boat.marinaName} {boat.marinaLocation && `— ${boat.marinaLocation}`}
                </span>
              )}
            </div>
          </div>
          
          {canWrite && (
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto pb-2">
               <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm border-border" onClick={() => setShowEditModal(true)}>
                 <Edit className="h-4 w-4 mr-2" /> Editar
               </Button>
               <Button variant="outline" className="w-full sm:w-auto h-10 shadow-sm text-destructive hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 border-destructive/20 hover:border-destructive/30" onClick={() => setShowDeleteConfirm(true)}>
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1 overflow-x-auto scrollbar-hide">
        {[
          { id: 'visao_geral', label: 'Visão Geral', icon: Ship },
          ...(!boat.isRental ? [{ id: 'financeiro', label: 'Financeiro', icon: Receipt }] : []),
          { id: 'historico', label: 'Histórico & Agenda', icon: Clock },
        ].map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all whitespace-nowrap border-b-2 relative top-[1px] cursor-pointer",
                 isActive 
                   ? "border-nautify-600 text-nautify-700 dark:text-nautify-400 bg-muted/30" 
                   : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
               )}
             >
               <Icon className={cn("h-4 w-4", isActive ? "text-nautify-600" : "")} />
               {tab.label}
             </button>
           );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[400px]"
        >
          
          {/* Aba VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {!boat.isRental && (
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-border/60 shadow-sm">
                  <CardHeader className="bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-nautify-600" />
                      Sócios e Participantes
                    </CardTitle>
                    {canWrite && (
                      <Button size="sm" variant="outline" onClick={() => setShowAddMemberModal(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {activeMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeMembers.map((member) => (
                          <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-full bg-nautify-100 border-2 border-background flex items-center justify-center text-sm font-bold text-nautify-700">
                              {member.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-semibold text-foreground truncate">{member.user.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="secondary" className="text-[10px] py-0 px-2 uppercase tracking-wider bg-primary/10 text-primary border-0">
                                   {member.role === 'admin' ? 'Admnistrador' : 'Sócio'}
                                 </Badge>
                                 <span className="text-xs text-muted-foreground whitespace-nowrap">Desde {new Date(member.joinedAt).getFullYear()}</span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        size="sm"
                        icon={Users}
                        title="Nenhum sócio ativo"
                        description="Adicione membros para dividirem os custos e utilizarem a embarcação."
                        actionLabel="Adicionar Sócio"
                        onAction={() => setShowAddMemberModal(true)}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
              )}

              <div className="space-y-6">
                 {/* Painel lateral de Quick Stats */}
                 <Card className="border border-border/60 shadow-sm">
                   <CardHeader className="bg-muted/20 border-b border-border/50">
                     <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                       <Navigation className="h-4 w-4" /> Resumo Rápido
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-5 pt-6">
                      <div className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Navigation className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-foreground">Saídas</span>
                              <span className="block text-xs text-muted-foreground">Últimos 30 dias</span>
                            </div>
                         </div>
                         <span className="text-xl font-bold">{trips.length > 0 ? trips.length : '-'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                               <Wrench className="h-5 w-5" />
                            </div>
                            <div>
                               <span className="block text-sm font-semibold text-foreground">Ocorrências</span>
                               <span className="block text-xs text-muted-foreground">Abertas / Pendentes</span>
                            </div>
                         </div>
                         <span className="text-xl font-bold">{incidents.length > 0 ? incidents.length : '-'}</span>
                      </div>
                      
                      <Button className="w-full mt-2 group shadow-sm bg-nautify-600 hover:bg-nautify-700 text-white cursor-pointer">
                         <FileText className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                         Gerar Relatório Completo
                      </Button>
                   </CardContent>
                 </Card>
              </div>
            </div>
          )}

          {/* Aba FINANCEIRO */}
          {activeTab === 'financeiro' && !boat.isRental && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard title="Despesas Recentes" value={formatCurrency(expenses.reduce((s: number, e: Expense) => s + e.amount, 0))} subtitle="últimos registros" icon={Receipt} iconBgColor="bg-red-100 dark:bg-red-500/20" iconColor="text-red-600 dark:text-red-400" />
                  <StatCard title="Despesas Pendentes" value={String(expenses.filter((e: Expense) => e.status !== 'paga').length)} subtitle="aguardando pagto" icon={AlertTriangle} iconBgColor="bg-amber-100 dark:bg-amber-500/20" iconColor="text-amber-600 dark:text-amber-400" />
                  <StatCard title="Em dia" value={String(expenses.filter((e: Expense) => e.status === 'paga').length)} subtitle="despesas pagas" icon={Receipt} iconBgColor="bg-emerald-100 dark:bg-emerald-500/20" iconColor="text-emerald-600 dark:text-emerald-400" />
                </div>

                <Card className="border border-border/60 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      Histórico Recente de Despesas
                    </CardTitle>
                    <Link href={`/financeiro/despesas?boat_id=${boatId}`}>
                       <Button variant="outline" size="sm" className="bg-background shadow-sm hover:bg-muted text-foreground cursor-pointer">Ver Relatório Total</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingExpenses ? (
                       <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : expenses.length > 0 ? (
                       <div className="divide-y divide-border/50">
                          {expenses.map((expense: Expense) => (
                            <div key={expense.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                    <Receipt className="h-6 w-6 text-muted-foreground" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-sm font-semibold text-foreground truncate mb-1">{expense.description}</p>
                                   <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                     <span>{formatDate(expense.createdAt)}</span>
                                     <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                     <span>{expense.category}</span>
                                   </div>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1.5 shrink-0 pl-4">
                                 <p className="text-sm font-bold tracking-tight">{formatCurrency(expense.amount)}</p>
                                 <Badge variant={expense.status === 'paga' ? 'secondary' : 'outline'} className={expense.status !== 'paga' ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800' : ''}>
                                    {expense.status}
                                 </Badge>
                              </div>
                            </div>
                          ))}
                       </div>
                    ) : (
                      <div className="py-8">
                        <EmptyState size="default" icon={Receipt} title="Nenhuma despesa" description="Sem registros de despesas recém atreladas à embarcação." />
                      </div>
                    )}
                  </CardContent>
                </Card>
             </div>
          )}

          {/* Aba HISTÓRICO */}
          {activeTab === 'historico' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-border/60 shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-muted-foreground" />
                      Últimas Saídas
                    </CardTitle>
                    <Link href={`/saidas?boat_id=${boatId}`}>
                       <Button variant="ghost" size="sm" className="cursor-pointer">Ver todas</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                     {loadingTrips ? (
                        <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                     ) : trips.length > 0 ? (
                        <div className="divide-y divide-border/50">
                          {trips.map((trip: Trip) => (
                            <div key={trip.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                              <div className="flex flex-col min-w-0 pr-4">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-foreground capitalize truncate">{trip.type === 'teste' ? 'Teste' : 'Uso Pessoal'}</span>
                                    <Badge variant={trip.status === 'finalizada' ? 'secondary' : 'outline'} className="text-[10px] py-0">{trip.status}</Badge>
                                 </div>
                                 <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <Calendar className="h-3.5 w-3.5" /> {formatDate(trip.startDate)}
                                 </span>
                              </div>
                            </div>
                          ))}
                        </div>
                     ) : (
                       <div className="py-6 h-full flex items-center justify-center">
                         <EmptyState size="sm" icon={Navigation} title="Nenhuma saída" description="Esta embarcação ainda não tem saídas registradas." />
                       </div>
                     )}
                  </CardContent>
                </Card>

                <Card className="border border-border/60 shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      Chamados / Ocorrências
                    </CardTitle>
                    <Link href={`/chamados?boat_id=${boatId}`}>
                       <Button variant="ghost" size="sm" className="cursor-pointer">Ver todos</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                     {loadingIncidents ? (
                        <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                     ) : incidents.length > 0 ? (
                        <div className="divide-y divide-border/50">
                          {incidents.map((incident: Incident) => (
                            <div key={incident.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                              <div className="flex flex-col min-w-0 pr-4">
                                 <span className="text-sm font-semibold text-foreground truncate mb-1">{incident.description}</span>
                                 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Est. {formatCurrency(incident.estimatedCost)}</span>
                              </div>
                              <Badge variant="outline" className={cn("text-[10px] py-0 shrink-0", incident.status === 'pendente' ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800' : '')}>
                                {incident.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                     ) : (
                       <div className="py-6 h-full flex items-center justify-center">
                         <EmptyState size="sm" icon={AlertTriangle} title="Nenhum chamado" description="Não há ocorrências ativas." />
                       </div>
                     )}
                  </CardContent>
                </Card>
             </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditImage(null); }} title="Editar Embarcação">
        <form className="space-y-4 mt-2" onSubmit={handleEdit}>
          <Input name="name" label="Nome" defaultValue={boat?.name} required />
          <div className="grid grid-cols-2 gap-4">
            <Select name="type" label="Tipo" defaultValue={boat?.type}>
              <option value="lancha">Lancha</option>
              <option value="jet">Jet Ski</option>
              <option value="veleiro">Veleiro</option>
              <option value="outro">Outro</option>
            </Select>
            <Input name="year" label="Ano" type="number" defaultValue={boat?.year} />
          </div>
          <Input name="model" label="Modelo" defaultValue={boat?.model} />
          <Input name="registrationNumber" label="Registro" defaultValue={boat?.registrationNumber} />
          <div className="grid grid-cols-2 gap-4">
            <Input name="marinaName" label="Marina" defaultValue={boat?.marinaName} />
            <Input name="marinaLocation" label="Localização" defaultValue={boat?.marinaLocation} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Foto da embarcação</label>
            <input type="file" accept="image/png,image/jpeg" className="hidden" id="edit-boat-image-input"
              onChange={(e) => setEditImage(e.target.files?.[0] || null)} />
            <label htmlFor="edit-boat-image-input" className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-nautify-300 transition-colors cursor-pointer block">
              {editImage ? (
                <>
                  <img src={URL.createObjectURL(editImage)} alt="Preview" className="h-24 w-full object-cover rounded-lg mb-2" />
                  <p className="text-xs text-muted-foreground">Clique para trocar</p>
                </>
              ) : boat?.imageUrl ? (
                <>
                  <img src={boat.imageUrl} alt={boat.name} className="h-24 w-full object-cover rounded-lg mb-2" />
                  <p className="text-xs text-muted-foreground">Clique para trocar a foto</p>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar foto</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG — opcional</p>
                </>
              )}
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditImage(null); }}>Cancelar</Button>
            <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Excluir Embarcação">
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span className="font-semibold text-foreground">{boat?.name}</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
            <Button variant="outline" className="text-destructive hover:bg-red-50 hover:text-red-700 border-destructive/30" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Adicionar Membro">
        <form className="space-y-4 mt-2" onSubmit={handleAddMember}>
          <Input name="userId" label="ID do Usuário (UUID)" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
          <Select name="role" label="Perfil">
            <option value="socio">Sócio</option>
            <option value="admin">Administrador</option>
            <option value="marinheiro">Marinheiro</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Adicionando...' : 'Adicionar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
