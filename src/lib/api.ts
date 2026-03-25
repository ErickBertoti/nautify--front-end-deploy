const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('nautify_token') : null;

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
      localStorage.removeItem('nautify_token');
      window.location.href = '/login';
    }
    throw new Error('Não autorizado');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}

async function requestBlob(endpoint: string): Promise<Blob> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nautify_token') : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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
