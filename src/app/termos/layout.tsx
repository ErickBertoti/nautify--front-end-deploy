'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermosLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          {pathname === '/termos' ? (
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.push('/dashboard')}>
              <ChevronLeft className="h-4 w-4" />
              Voltar ao Painel
            </Button>
          ) : (
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.push('/termos')}>
              <ChevronLeft className="h-4 w-4" />
              Voltar aos Termos
            </Button>
          )}
        </div>
        <div className="glass-panel p-6 sm:p-10 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nautify-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
