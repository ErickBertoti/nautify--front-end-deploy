'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { allNavItems } from './Sidebar';
import {
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  Anchor,
  User,
  LayoutDashboard,
  Ship,
  TrendingUp,
  Receipt,
  ArrowDownUp,
  History,
  Navigation,
  Fuel,
  CalendarDays,
  Wrench,
  Users,
  FileText,
  BarChart2,
  type LucideIcon,
} from 'lucide-react';

interface NavGroup {
  section: string;
  items: { label: string; href: string; icon: LucideIcon }[];
}

const mobileNavGroups: NavGroup[] = [
  {
    section: 'Painel',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Embarcações', href: '/embarcacoes', icon: Ship },
    ],
  },
  {
    section: 'Financeiro',
    items: [
      { label: 'Receitas', href: '/financeiro/receitas', icon: TrendingUp },
      { label: 'Despesas', href: '/financeiro/despesas', icon: Receipt },
      { label: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa', icon: ArrowDownUp },
      { label: 'Histórico', href: '/financeiro/historico', icon: History },
    ],
  },
  {
    section: 'Operações',
    items: [
      { label: 'Saídas', href: '/saidas', icon: Navigation },
      { label: 'Combustível', href: '/combustivel', icon: Fuel },
      { label: 'Agenda', href: '/agenda', icon: CalendarDays },
    ],
  },
  {
    section: 'Gestão',
    items: [
      { label: 'Manutenção', href: '/manutencao', icon: Wrench },
      { label: 'Sócios', href: '/socios', icon: Users },
      { label: 'Documentos', href: '/documentos', icon: FileText },
    ],
  },
  {
    section: 'Análises',
    items: [
      { label: 'Relatórios', href: '/relatorios', icon: BarChart2 },
      { label: 'Notificações', href: '/notificacoes', icon: Bell },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    if (mobileMenuOpen) closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const currentPage = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{currentPage?.label || 'Nautify'}</h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/notificacoes"
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Link>
          <div className="w-px h-6 bg-border mx-1" />
          <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-nautify-100 flex items-center justify-center">
              <User className="h-4 w-4 text-nautify-700" />
            </div>
            <span className="hidden sm:block text-sm font-medium">Gabriel</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className={isClosing ? 'fixed inset-0 bg-black/50 animate-backdrop-out' : 'fixed inset-0 bg-black/50 animate-backdrop-in'}
            onClick={closeMobileMenu}
          />
          <div
            className={cn(
              'fixed left-0 top-0 h-full w-72 bg-sidebar-bg text-sidebar-foreground shadow-xl flex flex-col',
              isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
            )}
          >
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-nautify-600">
                  <Anchor className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">Nautify</h1>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
                onClick={closeMobileMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav - Grouped */}
            <nav className="px-3 py-4 space-y-4 flex-1 overflow-y-auto">
              {mobileNavGroups.map((group) => (
                <div key={group.section}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-1">
                    {group.section}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-nautify-700/50 text-white'
                              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-white'
                          )}
                        >
                          <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-nautify-400' : '')} />
                          {item.label}
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nautify-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="px-3 py-4 border-t border-white/10 space-y-1">
              <Link
                href="/configuracoes"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:bg-sidebar-accent hover:text-white transition-all"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:bg-red-500/10 hover:text-red-400 transition-all w-full cursor-pointer">
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
