'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (!user.isPlatformAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user.isPlatformAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-100">
        <ShieldAlert className="h-10 w-10 text-amber-300" />
        <p className="text-lg font-semibold">Acesso restrito</p>
        <p className="max-w-md text-sm text-slate-400">
          Sua conta esta autenticada, mas nao possui permissao para a area administrativa.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
