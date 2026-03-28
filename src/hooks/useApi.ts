'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions {
  /** Auto-refresh interval in milliseconds. 0 or undefined = disabled. */
  refreshInterval?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = [],
  options?: UseApiOptions,
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (mountedRef.current) setData(res.data);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  // Auto-refresh interval
  useEffect(() => {
    const interval = options?.refreshInterval;
    if (!interval || interval <= 0) return;
    const id = setInterval(() => {
      if (mountedRef.current) fetch();
    }, interval);
    return () => clearInterval(id);
  }, [fetch, options?.refreshInterval]);

  return { data, loading, error, refetch: fetch };
}
