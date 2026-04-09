'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  Tags,
  Layers3,
  ScrollText,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { authService } from '@/services';
import { cn, formatDate } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Cobrancas', href: '/admin/cobrancas', icon: CreditCard },
  { label: 'Promocoes', href: '/admin/promocoes', icon: Tags },
  { label: 'Planos', href: '/admin/planos', icon: Layers3 },
  { label: 'Auditoria', href: '/admin/auditoria', icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.12),_transparent_32%),linear-gradient(180deg,_#0b1020_0%,_#111827_42%,_#0a0f1c_100%)] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-amber-500/10 bg-slate-950/75 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="border-b border-white/6 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image src="/logo-white.png" alt="Nautify" width={40} height={40} />
              <span className="absolute -bottom-1 -right-1 rounded-full border border-slate-950 bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-950">
                Admin
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Nautify Control</p>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-200/70">Platform Ops</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          <div className="rounded-2xl border border-amber-500/12 bg-gradient-to-br from-amber-500/12 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-400/12 p-2 text-amber-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'Operador'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'Sem sessao'}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Acesso operacional global. Toda mutacao sensivel fica auditada.
            </p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all',
                    isActive
                      ? 'bg-amber-400/12 text-white shadow-[inset_0_0_0_1px_rgba(251,191,36,0.18)]'
                      : 'text-slate-400 hover:bg-white/4 hover:text-slate-100',
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-amber-200' : 'text-slate-500 group-hover:text-slate-200')} />
                  <span className="font-medium tracking-[0.01em]">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-white/6 px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/4 hover:text-white"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Voltar ao app
          </Link>
          <button
            onClick={() => authService.logout()}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
          >
            <LogOut className="h-4.5 w-4.5" />
            Encerrar sessao
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/6 bg-slate-950/55 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">Area administrativa</p>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                {navItems.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Overview'}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ultimo acesso</p>
              <p className="text-sm text-slate-200">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
