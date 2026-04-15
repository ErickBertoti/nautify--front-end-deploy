'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AUTH_STATE_PROFILE_REQUIRED } from '@/lib/auth-constants';
import { buildPendingRegistrationScaffold, syncBackendAuth } from '@/lib/auth-flow';
import { createClient } from '@/utils/supabase/client';

function sanitizeNext(next: string | null) {
  return next && next.startsWith('/') ? next : '/dashboard';
}

function AuthBridgePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function runBridge() {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !session?.access_token) {
        router.replace('/login?error=auth-callback');
        return;
      }

      const next = sanitizeNext(searchParams.get('next'));

      try {
        const status = await syncBackendAuth(session.access_token, {
          profileRequiredFallback: buildPendingRegistrationScaffold(session.user),
        });

        if (!isMounted) {
          return;
        }

        if (status === AUTH_STATE_PROFILE_REQUIRED) {
          router.replace(`/auth/complete-profile?next=${encodeURIComponent(next)}`);
          return;
        }

        router.replace(next);
      } catch (bridgeError) {
        if (!isMounted) {
          return;
        }

        setError(bridgeError instanceof Error ? bridgeError.message : 'Não foi possível concluir seu acesso.');
      }
    }

    runBridge();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-2xl border border-white/10 bg-[rgba(20,27,43,0.92)] p-8 text-white shadow-2xl">
          {error ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-[#dce2f7]">Falha ao concluir o acesso</h1>
                <p className="text-sm leading-relaxed text-[#8f9097]">{error}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.replace('/login')}>
                  Voltar ao login
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-[#b9c6eb]">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-[#dce2f7]">Concluindo seu acesso</h1>
                <p className="text-sm leading-relaxed text-[#8f9097]">
                  Estamos vinculando sua sessão à sua conta Nautify.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8f9097]">
                Aguarde alguns instantes
              </p>
            </div>
          )}

          {!error && (
            <p className="mt-8 text-center text-xs text-[#8f9097]">
              Problemas com o retorno?{' '}
              <Link href="/login" className="text-[#eec068] transition-colors hover:text-white">
                Volte para o login
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthBridgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)]" />}>
      <AuthBridgePageContent />
    </Suspense>
  );
}
