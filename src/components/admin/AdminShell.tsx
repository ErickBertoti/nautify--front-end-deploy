'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
  Menu,
  X,
} from 'lucide-react';
import { authService } from '@/services';
import { cn, formatDate } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Cobranças', href: '/admin/cobrancas', icon: CreditCard },
  { label: 'Promoções', href: '/admin/promocoes', icon: Tags },
  { label: 'Planos', href: '/admin/planos', icon: Layers3 },
  { label: 'Auditoria', href: '/admin/auditoria', icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentNavItem =
    navItems.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) ||
    navItems[0];

  useEffect(() => {
    if (!drawerOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.12),_transparent_32%),linear-gradient(180deg,_#0b1020_0%,_#111827_42%,_#0a0f1c_100%)] text-slate-100">
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
        userName={user?.name}
        userEmail={user?.email}
      />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-amber-500/10 bg-slate-950/75 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="border-b border-white/6 px-6 py-6">
          <BrandHeader />
        </div>

        <div className="flex-1 px-4 py-5">
          <IdentityCard userName={user?.name} userEmail={user?.email} />
          <AdminNav pathname={pathname} />
        </div>

        <AdminFooter />
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/6 bg-slate-950/55 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition-colors hover:bg-white/10 lg:hidden"
                aria-label="Abrir navegacao administrativa"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70 sm:text-[11px] sm:tracking-[0.22em]">
                  Area administrativa
                </p>
                <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {currentNavItem.label}
                </h1>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ultimo acesso</p>
              <p className="text-sm text-slate-200">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto min-w-0 max-w-[1600px] px-4 py-5 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
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
  );
}

function IdentityCard({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/12 bg-gradient-to-br from-amber-500/12 to-transparent p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-400/12 p-2 text-amber-200">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userName || 'Operador'}</p>
          <p className="truncate text-xs text-slate-400">{userEmail || 'Sem sessao'}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        Acesso operacional global. Toda mutacao sensivel fica auditada.
      </p>
    </div>
  );
}

function AdminNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 space-y-1.5">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
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
  );
}

function AdminFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-2 border-t border-white/6 px-4 py-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-white/4 hover:text-white"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Voltar ao app
      </Link>
      <button
        onClick={() => {
          onNavigate?.();
          authService.logout();
        }}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
      >
        <LogOut className="h-4.5 w-4.5" />
        Encerrar sessao
      </button>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  pathname,
  userName,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  userName?: string;
  userEmail?: string;
}) {
  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', open ? '' : 'pointer-events-none')}>
      <button
        type="button"
        aria-label="Fechar navegacao administrativa"
        className={cn(
          'absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex w-[min(86vw,22rem)] flex-col border-r border-amber-500/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
          <BrandHeader />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition-colors hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <IdentityCard userName={userName} userEmail={userEmail} />
          <AdminNav pathname={pathname} onNavigate={onClose} />
        </div>

        <AdminFooter onNavigate={onClose} />
      </div>
    </div>
  );
}
