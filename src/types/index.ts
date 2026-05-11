// ============================================
// NAUTIFY - Tipos TypeScript
// Sistema de Gestão de Sociedades Náuticas
// ============================================

// --- Perfis de Usuário ---
export type UserRole = 'admin' | 'socio' | 'marinheiro';
export type DocumentType = 'cpf' | 'cnpj';
export type InstallmentStrategy = 'single' | 'generated' | 'metadata_only';
export type PaymentMethod = 'pix' | 'transferencia' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'dinheiro' | 'outro';
export type RefundStatus = 'none' | 'partial' | 'full';

export interface UserAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UserMembership {
  boatId: string;
  boatName: string;
  role: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  documentType?: DocumentType;
  document?: string;
  birthDate?: string;
  address?: UserAddress;
  memberships?: UserMembership[];
  accountStatus: 'active' | 'suspended';
  authVersion: number;
  isPlatformAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoatMembership {
  userId: string;
  boatId: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
}

// --- Embarcações ---
export interface Boat {
  id: string;
  name: string;
  type: 'lancha' | 'jet' | 'veleiro' | 'outro';
  model?: string;
  year?: number;
  registrationNumber?: string;
  imageUrl?: string;
  marinaName?: string;
  marinaLocation?: string;
  isRental?: boolean;
  createdAt: string;
  members: BoatMember[];
  subscription?: Subscription;
}

export interface BoatMember {
  id: string;
  user: User;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
}

// --- Despesas ---
export type ExpenseCategory = 'fixa' | 'variavel' | 'individual';
export type ExpenseIndividualMode = 'exclusivo' | 'rateado';
export type ExpenseStatus = 'pendente' | 'paga' | 'vencida';

export interface Expense {
  id: string;
  boatId: string;
  boatName?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  individualMode?: ExpenseIndividualMode;
  responsibleUserId?: string;
  responsibleUser?: User;
  splitAmount?: number;
  splitCount?: number;
  installmentStrategy: InstallmentStrategy;
  installmentGroupId?: string;
  installmentIndex: number;
  installmentCount: number;
  dueDate?: string;
  status: ExpenseStatus;
  paidByUserId?: string;
  paidByUser?: User;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  createdBy: string;
  createdAt: string;
}

// --- Receitas ---
export type RevenueCategory = 'mensalidade' | 'aluguel' | 'evento' | 'taxa' | 'outro';
export type RevenueStatus = 'pendente' | 'recebida' | 'atrasada';

export interface Revenue {
  id: string;
  boatId: string;
  boatName?: string;
  description: string;
  amount: number;
  category: RevenueCategory;
  payerUserId?: string;
  payerUser?: User;
  dueDate?: string;
  receivedDate?: string;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  status: RevenueStatus;
  createdBy: string;
  createdAt: string;
}

// --- Fluxo de Caixa ---
export type CashFlowType = 'entrada' | 'saida';

export interface CashFlowEntry {
  id: string;
  boatId: string;
  boatName?: string;
  type: CashFlowType;
  description: string;
  amount: number;
  date: string;
  relatedExpenseId?: string;
  relatedRevenueId?: string;
  relatedContributionId?: string;
  paymentMethod?: PaymentMethod;
  paidByUserId?: string;
  paidByUser?: User;
  refundOfEntryId?: string;
  createdAt: string;
}

export interface CashFlowSummary {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  entriesByMonth: {
    month: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }[];
}

// --- Saídas ---
export type TripStatus = 'agendada' | 'em_andamento' | 'finalizada' | 'com_ocorrencia' | 'cancelada';
export type TripType = 'uso' | 'teste';

export interface Trip {
  id: string;
  boatId: string;
  boatName?: string;
  type: TripType;
  responsibleUserId?: string;
  responsibleUser?: User;
  sailorId?: string;
  sailor?: User;
  startDate: string;
  endDate?: string;
  status: TripStatus;
  observations?: string;
  occurrence?: string;
  occurrenceDescription?: string;
  createdAt: string;
}

export interface TripOccurrenceResponse {
  id: string;
  status: TripStatus;
}

// --- Abastecimentos / Combustível ---
export type FuelAssociation = 'socio' | 'teste';
export type FuelType = 'gasolina' | 'diesel';

export interface FuelBreakdownItem {
  fuelType: FuelType;
  liters: number;
  totalValue: number;
  pricePerLiter: number;
}

export interface Fueling {
  id: string;
  boatId: string;
  boatName?: string;
  date: string;
  liters: number;
  totalValue: number;
  pricePerLiter?: number;
  fuelBreakdown?: FuelBreakdownItem[];
  associationType: FuelAssociation;
  associatedUserId?: string;
  associatedUser?: User;
  associatedTripId?: string;
  observations?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  createdAt: string;
}

export interface FuelConsumptionSummary {
  totalLiters: number;
  totalCost: number;
  avgPricePerLiter: number;
  avgLitersPerTrip: number;
  monthlyData: {
    month: string;
    liters: number;
    cost: number;
  }[];
}

// --- Chamados / Ocorrências ---
export type IncidentStatus = 'pendente' | 'aprovado' | 'pago';

export interface Incident {
  id: string;
  boatId: string;
  boatName?: string;
  tripId: string;
  description: string;
  estimatedCost: number;
  photos: string[];
  status: IncidentStatus;
  expenseMode?: ExpenseIndividualMode;
  generatedExpenseId?: string;
  createdBy: string;
  createdByUser?: User;
  createdAt: string;
}

// --- Manutenção ---
export type MaintenanceType = 'preventiva' | 'corretiva';
export type MaintenanceStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
export type MaintenancePriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Maintenance {
  id: string;
  boatId: string;
  boatName?: string;
  title: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  responsibleUserId?: string;
  responsibleUser?: User;
  parts: MaintenancePart[];
  notes?: string;
  completionNotes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MaintenanceCompletePayload {
  actualCost: number;
  completedDate: string;
  completionNotes?: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaintenancePartHistory {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  maintenanceId: string;
  maintenanceTitle: string;
  scheduledDate: string;
  boatId: string;
  boatName: string;
}

// --- Agenda ---
export type EventType = 'reserva' | 'manutencao' | 'lembrete' | 'evento' | 'outro';
export type EventStatus = 'confirmado' | 'pendente' | 'cancelado';

export interface CalendarEvent {
  id: string;
  boatId?: string;
  boatName?: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  createdByUserId: string;
  createdByUser?: User;
  attendees?: User[];
  reminderMinutes?: number;
  relatedMaintenanceId?: string;
  relatedTripId?: string;
  createdAt: string;
}

// Evento unificado da agenda: agrega manutenções, saídas e eventos manuais
// em um único shape, alimentado pelo endpoint /api/calendar.
export type CalendarEventKind = 'maintenance' | 'trip' | 'event';

export interface UnifiedCalendarEvent {
  id: string;
  kind: CalendarEventKind;
  refId: string;
  title: string;
  subtitle?: string;
  start: string;
  end?: string | null;
  allDay: boolean;
  boatId: string;
  boatName?: string;
  status?: string;
  color?: string;
  subtype?: string;
  meta?: Record<string, unknown>;
}

// --- Sócios ---
export type PartnerStatus = 'ativo' | 'inativo' | 'suspenso';

export interface Partner {
  id: string;
  user: User;
  boatId: string;
  boatName?: string;
  role: UserRole;
  status: PartnerStatus;
  participationPercent: number;
  monthlyContribution: number;
  joinedAt: string;
  leftAt?: string;
  totalContributed: number;
  pendingPayments: number;
}

export interface PartnerContribution {
  id: string;
  partnerId: string;
  partnerUser?: User;
  boatId: string;
  amount: number;
  month: string;
  paidAt?: string;
  paidByUserId?: string;
  paidByUser?: User;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  createdAt: string;
}

// --- Documentos ---
export type DocumentCategory = 'seguro' | 'habilitacao' | 'contrato' | 'licenca' | 'vistoria' | 'outro';
export type DocumentStatus = 'valido' | 'vencendo' | 'vencido';

export interface Document {
  id: string;
  boatId?: string;
  boatName?: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expirationDate?: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedByUser?: User;
  createdAt: string;
}

// --- Notificações ---
export type NotificationType = 'manutencao' | 'financeiro' | 'documento' | 'sistema' | 'agenda' | 'embarcacao';
export type NotificationPriority = 'baixa' | 'media' | 'alta';

export type BoatInvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface BoatInvitation {
  id: string;
  boatId: string;
  invitedEmail: string;
  role: UserRole;
  status: BoatInvitationStatus;
  createdAt: string;
  respondedAt?: string;
  boatName?: string;
  inviterName?: string;
}

export interface NotificationInvitation {
  id: string;
  boatId: string;
  boatName: string;
  invitedEmail: string;
  role: UserRole;
  status: BoatInvitationStatus;
  inviterName: string;
}

export interface SettlementRequest {
  paidByUserId?: string;
  payerUserId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  paidAt?: string;
  receivedAt?: string;
}

export interface RefundRequest {
  refundAmount?: number;
  reason?: string;
  refundedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  invitation?: NotificationInvitation;
}

// --- Relatórios ---
export type ReportType = 'financeiro' | 'uso' | 'manutencao' | 'combustivel' | 'geral';
export type ReportPeriod = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';

export interface ReportFilter {
  type: ReportType;
  period: ReportPeriod;
  boatId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  generatedAt: string;
  summary: Record<string, number>;
  chartData: Record<string, unknown>[];
}

// --- Dashboard Expandido ---
export interface DashboardStats {
  totalBoats: number;
  totalExpensesMonth: number;
  totalRevenueMonth: number;
  totalFuelCostMonth: number;
  totalFuelLitersMonth: number;
  totalTripsMonth: number;
  pendingIncidents: number;
  pendingMaintenances: number;
  expiringDocuments: number;
  unreadNotifications: number;
  cashFlowBalance: number;
  revenueChangePercent: number;
  expensesChangePercent: number;
  upcomingExpenses: Expense[];
  recentFuelings: Fueling[];
  recentTrips: Trip[];
  recentIncidents: Incident[];
  upcomingEvents: CalendarEvent[];
  upcomingMaintenances: Maintenance[];
  monthlyExpensesByCategory: {
    fixa: number;
    variavel: number;
    individual: number;
  };
  monthlyRevenueVsExpense: {
    month: string;
    revenue: number;
    expense: number;
  }[];
}

// --- Billing ---
export type SubscriptionStatus = 'trialing' | 'pending' | 'active' | 'overdue' | 'canceled';

export interface Plan {
  id: string;
  code: string;
  name: string;
  price: number;
  billingCycle: string;
  active: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  boatId: string;
  boatName?: string;
  ownerUserId: string;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  billingType: string;
  value: number;
  nextDueDate?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillingPromotionMode = 'fixed_price' | 'amount_off' | 'percent_off';
export type SyncStatus = 'not_required' | 'pending' | 'synced' | 'failed';

export interface BillingPromotion {
  id: string;
  code: string;
  name: string;
  mode: BillingPromotionMode;
  value: number;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPriceChange {
  id: string;
  subscriptionId: string;
  promotionId?: string;
  source: 'manual_override' | 'promotion' | 'plan_propagation';
  oldValue: number;
  newValue: number;
  reason: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  syncStatus: SyncStatus;
  syncedAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  targetUserId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  platformAdmins: number;
  totalBoats: number;
  trialSubscriptions: number;
  overdueSubscriptions: number;
  activeSubscriptions: number;
  mrr: number;
  activePromotions: number;
  recentAuditLogs: AdminAuditLog[];
}

export interface AdminAccountSummary {
  user: User;
  boatsOwned: number;
  boatsAsMember: number;
  latestSubscription?: Subscription;
}

export interface AdminSubscriptionSummary extends Subscription {
  ownerName: string;
  ownerEmail: string;
  latestPriceChange?: SubscriptionPriceChange;
}

export interface AdminPlanUpdateResult {
  plan: Plan;
  propagated: number;
  failed: number;
  failures: Array<{
    subscriptionId: string;
    error: string;
  }>;
  propagateToExisting: boolean;
}

// --- API ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
