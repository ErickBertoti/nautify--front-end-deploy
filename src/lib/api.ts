import { clearSupabaseAndBackendAuth, getBackendToken } from '@/lib/auth-state';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiErrorPayload {
  message?: string;
  code?: string;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = getBackendToken();

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await clearSupabaseAndBackendAuth();
      window.location.href = '/login';
    }
    throw new ApiError('Não autorizado', response.status);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' })) as ApiErrorPayload;
    throw new ApiError(error.message || 'Erro na requisição', response.status, error.code);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  return response.json();
}

async function requestBlob(endpoint: string): Promise<Blob> {
  const token = getBackendToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await clearSupabaseAndBackendAuth();
      window.location.href = '/login';
    }
    throw new Error('Não autorizado');
  }

  if (!response.ok) {
    throw new Error('Erro ao baixar arquivo');
  }

  return response.blob();
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) => request<T>(endpoint, { headers }),
  post: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => request<T>(endpoint, { method: 'POST', body, headers }),
  put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => request<T>(endpoint, { method: 'PUT', body, headers }),
  patch: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => request<T>(endpoint, { method: 'PATCH', body, headers }),
  delete: <T>(endpoint: string, headers?: Record<string, string>) => request<T>(endpoint, { method: 'DELETE', headers }),
  getBlob: (endpoint: string) => requestBlob(endpoint),
};
