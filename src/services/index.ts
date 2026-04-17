import { api } from '@/lib/api';
import { clearSupabaseAndBackendAuth } from '@/lib/auth-state';
import type {
  User,
  UserAddress,
  DocumentType,
  Boat,
  Expense,
  Revenue,
  CashFlowSummary,
  CashFlowEntry,
  Trip,
  Fueling,
  FuelConsumptionSummary,
  Incident,
  Maintenance,
  MaintenancePartHistory,
  CalendarEvent,
  Partner,
  PartnerContribution,
  Document,
  Notification,
  ReportData,
  ReportFilter,
  DashboardStats,
  Plan,
  Subscription,
  BillingPromotion,
  SubscriptionPriceChange,
  AdminAuditLog,
  AdminOverview,
  AdminAccountSummary,
  AdminSubscriptionSummary,
  AdminPlanUpdateResult,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

// ============================================
// Auth
// ============================================
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password }),

  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    documentType?: DocumentType;
    document?: string;
    birthDate?: string;
    address?: UserAddress;
  }) => api.post<ApiResponse<User>>('/auth/register', data),

  supabaseExchange: (supabaseToken: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/supabase-exchange',
      {},
      { Authorization: `Bearer ${supabaseToken}` },
    ),

  supabaseLogin: (supabaseToken: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/supabase-login',
      {},
      { Authorization: `Bearer ${supabaseToken}` },
    ),

  supabaseRegister: (supabaseToken: string, data: {
    name: string;
    phone?: string;
    documentType?: DocumentType;
    document?: string;
    birthDate?: string;
    address?: UserAddress;
  }) =>
    api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/supabase-register',
      data,
      { Authorization: `Bearer ${supabaseToken}` },
    ),

  me: () => api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<Omit<User, 'id' | 'createdAt'>>) =>
    api.put<ApiResponse<User>>('/auth/profile', data),

  checkAvailability: (data: { email?: string; document?: string }) =>
    api.post<ApiResponse<{ emailAvailable: boolean; documentAvailable: boolean }>>('/auth/check-availability', data),

  logout: async () => {
    await clearSupabaseAndBackendAuth();
    window.location.href = '/login';
  },
};

// ============================================
// Dashboard
// ============================================
export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};

// ============================================
// Embarcações
// ============================================
export const boatService = {
  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Boat>>(`/boats?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get<ApiResponse<Boat>>(`/boats/${id}`),

  create: (data: Partial<Boat>) => api.post<ApiResponse<Boat>>('/boats', data),

  update: (id: string, data: Partial<Boat>) => api.put<ApiResponse<Boat>>(`/boats/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/boats/${id}`),

  inviteMember: (boatId: string, data: { email: string; role: string }) =>
    api.post<ApiResponse<void>>(`/boats/${boatId}/invitations`, data),

  removeMember: (boatId: string, memberId: string) =>
    api.delete<ApiResponse<void>>(`/boats/${boatId}/members/${memberId}`),
};

export const boatInvitationService = {
  accept: (id: string) => api.post<ApiResponse<{ id: string; status: string }>>(`/boat-invitations/${id}/accept`, {}),

  reject: (id: string) => api.post<ApiResponse<{ id: string; status: string }>>(`/boat-invitations/${id}/reject`, {}),
};

// ============================================
// Despesas
// ============================================
export const expenseService = {
  list: (params?: { boatId?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Expense>>(`/expenses?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Expense>>(`/expenses/${id}`),

  create: (data: Partial<Expense>) => api.post<ApiResponse<Expense>>('/expenses', data),

  update: (id: string, data: Partial<Expense>) =>
    api.put<ApiResponse<Expense>>(`/expenses/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/expenses/${id}`),

  markAsPaid: (id: string) => api.patch<ApiResponse<Expense>>(`/expenses/${id}/pay`, {}),
};

// ============================================
// Receitas
// ============================================
export const revenueService = {
  list: (params?: { boatId?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Revenue>>(`/revenues?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Revenue>>(`/revenues/${id}`),

  create: (data: Partial<Revenue>) => api.post<ApiResponse<Revenue>>('/revenues', data),

  update: (id: string, data: Partial<Revenue>) =>
    api.put<ApiResponse<Revenue>>(`/revenues/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/revenues/${id}`),

  markAsReceived: (id: string) => api.patch<ApiResponse<Revenue>>(`/revenues/${id}/receive`, {}),
};

// ============================================
// Fluxo de Caixa
// ============================================
export const cashFlowService = {
  getSummary: (params?: { boatId?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.startDate) query.set('start_date', params.startDate);
    if (params?.endDate) query.set('end_date', params.endDate);
    return api.get<ApiResponse<CashFlowSummary>>(`/cashflow/summary?${query.toString()}`);
  },

  listEntries: (params?: { boatId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.startDate) query.set('start_date', params.startDate);
    if (params?.endDate) query.set('end_date', params.endDate);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<CashFlowEntry>>(`/cashflow/entries?${query.toString()}`);
  },
};

// ============================================
// Saídas
// ============================================
export const tripService = {
  list: (params?: { boatId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Trip>>(`/trips?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Trip>>(`/trips/${id}`),

  create: (data: Partial<Trip>) => api.post<ApiResponse<Trip>>('/trips', data),

  start: (id: string) => api.patch<ApiResponse<Trip>>(`/trips/${id}/start`, {}),

  finish: (id: string, observations?: string) =>
    api.patch<ApiResponse<Trip>>(`/trips/${id}/finish`, { observations }),

  cancel: (id: string) => api.patch<ApiResponse<Trip>>(`/trips/${id}/cancel`, {}),
};

// ============================================
// Combustível / Abastecimentos
// ============================================
export const fuelingService = {
  list: (params?: { boatId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Fueling>>(`/fuelings?${query.toString()}`);
  },

  create: (data: Partial<Fueling>) => api.post<ApiResponse<Fueling>>('/fuelings', data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/fuelings/${id}`),

  getConsumptionSummary: (boatId?: string) => {
    const query = boatId ? `?boat_id=${boatId}` : '';
    return api.get<ApiResponse<FuelConsumptionSummary>>(`/fuelings/summary${query}`);
  },
};

// ============================================
// Chamados
// ============================================
export const incidentService = {
  list: (params?: { boatId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Incident>>(`/incidents?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Incident>>(`/incidents/${id}`),

  create: (data: {
    boatId: string;
    tripId: string;
    description: string;
    estimatedCost: number;
    photos?: string[];
  }) => api.post<ApiResponse<Incident>>('/incidents', data),

  approve: (id: string, data: { expenseMode: 'exclusivo' | 'rateado'; responsibleUserId?: string }) =>
    api.patch<ApiResponse<Incident>>(`/incidents/${id}/approve`, data),

  markAsPaid: (id: string) => api.patch<ApiResponse<Incident>>(`/incidents/${id}/pay`, {}),
};

// ============================================
// Manutenção
// ============================================
export const maintenanceService = {
  list: (params?: { boatId?: string; type?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Maintenance>>(`/maintenances?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Maintenance>>(`/maintenances/${id}`),

  create: (data: Partial<Maintenance>) => api.post<ApiResponse<Maintenance>>('/maintenances', data),

  update: (id: string, data: Partial<Maintenance>) =>
    api.put<ApiResponse<Maintenance>>(`/maintenances/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/maintenances/${id}`),

  complete: (id: string, data: { actualCost?: number; notes?: string }) =>
    api.patch<ApiResponse<Maintenance>>(`/maintenances/${id}/complete`, data),

  listParts: (params?: { boatId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<MaintenancePartHistory>>(`/maintenance-parts?${query.toString()}`);
  },
};

// ============================================
// Agenda / Eventos
// ============================================
export const calendarService = {
  list: (params?: { boatId?: string; startDate?: string; endDate?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.startDate) query.set('start_date', params.startDate);
    if (params?.endDate) query.set('end_date', params.endDate);
    if (params?.type) query.set('type', params.type);
    return api.get<ApiResponse<CalendarEvent[]>>(`/events?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<CalendarEvent>>(`/events/${id}`),

  create: (data: Partial<CalendarEvent>) => api.post<ApiResponse<CalendarEvent>>('/events', data),

  update: (id: string, data: Partial<CalendarEvent>) =>
    api.put<ApiResponse<CalendarEvent>>(`/events/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/events/${id}`),

  cancel: (id: string) => api.patch<ApiResponse<CalendarEvent>>(`/events/${id}/cancel`, {}),

  bulkCreate: (events: Partial<CalendarEvent>[]) =>
    api.post<ApiResponse<{ created: number }>>('/events/bulk', { events }),
};

// ============================================
// Sócios
// ============================================
export const partnerService = {
  list: (params?: { boatId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Partner>>(`/partners?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Partner>>(`/partners/${id}`),

  create: (data: Partial<Partner>) => api.post<ApiResponse<Partner>>('/partners', data),

  update: (id: string, data: Partial<Partner>) =>
    api.put<ApiResponse<Partner>>(`/partners/${id}`, data),

  deactivate: (id: string) => api.patch<ApiResponse<Partner>>(`/partners/${id}/deactivate`, {}),

  contributions: (partnerId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<PartnerContribution>>(`/partners/${partnerId}/contributions?${query.toString()}`);
  },

  listAllContributions: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<PartnerContribution>>(`/contributions?${query.toString()}`);
  },

  payContribution: (contributionId: string) =>
    api.patch<ApiResponse<PartnerContribution>>(`/contributions/${contributionId}/pay`, {}),

  generateContributions: () =>
    api.post<ApiResponse<{ month: string; generated: number }>>('/contributions/generate', {}),
};

// ============================================
// Documentos
// ============================================
export const documentService = {
  list: (params?: { boatId?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.boatId) query.set('boat_id', params.boatId);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Document>>(`/documents?${query.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Document>>(`/documents/${id}`),

  upload: (data: FormData) => api.post<ApiResponse<Document>>('/documents', data),

  create: (data: {
    title: string;
    description?: string;
    category: string;
    boatId?: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expirationDate?: string;
  }) => api.post<ApiResponse<Document>>('/documents', data),

  update: (id: string, data: Partial<Document>) =>
    api.put<ApiResponse<Document>>(`/documents/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`/documents/${id}`),

  download: (id: string) => api.get<Blob>(`/documents/${id}/download`),
};

// ============================================
// Notificações
// ============================================
export const notificationService = {
  list: (params?: { isRead?: boolean; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.isRead !== undefined) query.set('is_read', String(params.isRead));
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get<PaginatedResponse<Notification>>(`/notifications?${query.toString()}`);
  },

  markAsRead: (id: string) => api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {}),

  markAllAsRead: () => api.patch<ApiResponse<void>>('/notifications/read-all', {}),

  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};

// ============================================
// Planos
// ============================================
export const planService = {
  list: () => api.get<ApiResponse<Plan[]>>('/plans'),
};

// ============================================
// Assinaturas
// ============================================
export const subscriptionService = {
  list: () => api.get<ApiResponse<Subscription[]>>('/subscriptions'),

  getById: (id: string) => api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  cancel: (id: string) => api.post<ApiResponse<void>>(`/subscriptions/${id}/cancel`, {}),

  activate: (id: string) => api.post<ApiResponse<{ id: string; status: string }>>(`/subscriptions/${id}/activate`, {}),

  getPaymentLink: (id: string) => api.get<ApiResponse<{ invoiceUrl: string; bankSlipUrl: string; status: string; dueDate: string }>>(`/subscriptions/${id}/payment-link`),
};

export const adminService = {
  getOverview: () => api.get<ApiResponse<AdminOverview>>('/admin/overview'),

  listAccounts: () => api.get<ApiResponse<AdminAccountSummary[]>>('/admin/accounts'),

  getAccount: (id: string) => api.get<ApiResponse<AdminAccountSummary>>(`/admin/accounts/${id}`),

  updateAccountStatus: (id: string, data: { status: 'active' | 'suspended'; reason?: string }) =>
    api.patch<ApiResponse<AdminAccountSummary>>(`/admin/accounts/${id}/status`, data),

  listSubscriptions: () => api.get<ApiResponse<AdminSubscriptionSummary[]>>('/admin/subscriptions'),

  updateSubscriptionPrice: (id: string, data: { value?: number; promotionId?: string; reason?: string }) =>
    api.patch<ApiResponse<{ subscription: AdminSubscriptionSummary; change: SubscriptionPriceChange }>>(`/admin/subscriptions/${id}/price`, data),

  updateSubscriptionPlan: (id: string, data: { planId: string; reason?: string }) =>
    api.patch<ApiResponse<{ subscription: AdminSubscriptionSummary; change: SubscriptionPriceChange }>>(`/admin/subscriptions/${id}/plan`, data),

  cancelSubscription: (id: string) =>
    api.post<ApiResponse<{ id: string; status: string }>>(`/admin/subscriptions/${id}/cancel`, {}),

  reactivateSubscription: (id: string) =>
    api.post<ApiResponse<Subscription>>(`/admin/subscriptions/${id}/reactivate`, {}),

  listPromotions: () => api.get<ApiResponse<BillingPromotion[]>>('/admin/promotions'),

  createPromotion: (data: {
    code: string;
    name: string;
    mode: BillingPromotion['mode'];
    value: number;
    startsAt?: string;
    endsAt?: string;
    active?: boolean;
  }) => api.post<ApiResponse<BillingPromotion>>('/admin/promotions', data),

  updatePromotion: (id: string, data: Partial<{
    code: string;
    name: string;
    mode: BillingPromotion['mode'];
    value: number;
    startsAt: string;
    endsAt: string;
    clearStartsAt: boolean;
    clearEndsAt: boolean;
    active: boolean;
  }>) => api.patch<ApiResponse<BillingPromotion>>(`/admin/promotions/${id}`, data),

  updatePlan: (id: string, data: { price: number; propagateToExisting: boolean; reason?: string }) =>
    api.patch<ApiResponse<AdminPlanUpdateResult>>(`/admin/plans/${id}`, data),

  listAuditLogs: (limit = 50) => api.get<ApiResponse<AdminAuditLog[]>>(`/admin/audit-logs?limit=${limit}`),
};

// ============================================
// Relatórios
// ============================================
export const reportService = {
  generate: (filter: ReportFilter) => api.post<ApiResponse<ReportData>>('/reports/generate', filter),

  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<ReportData>>(`/reports?page=${page}&limit=${limit}`),

  export: (filter: ReportFilter, format: 'pdf' | 'xlsx' | 'csv') => {
    const params = new URLSearchParams({ format, type: filter.type, period: filter.period });
    if (filter.boatId) params.set('boat_id', filter.boatId);
    if (filter.startDate) params.set('start_date', filter.startDate);
    if (filter.endDate) params.set('end_date', filter.endDate);
    return api.getBlob(`/reports/export?${params.toString()}`);
  },
};
