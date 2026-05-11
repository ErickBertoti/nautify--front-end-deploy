'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { authService } from '@/services';
import { useHasAnyFinancialBoat } from '@/hooks/useBoatPermissions';
import Image from 'next/image';
import {
  LayoutDashboard,
  Ship,
  TrendingUp,
  Receipt,
  ArrowDownUp,
  History,
  CreditCard,
  Navigation,
  Fuel,
  CalendarDays,
  Wrench,
  Users,
  UserCog,
  Banknote,
  FileText,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  financialOnly?: boolean;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
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
      { label: 'Receitas', href: '/financeiro/receitas', icon: TrendingUp, financialOnly: true },
      { label: 'Despesas', href: '/financeiro/despesas', icon: Receipt, financialOnly: true },
      { label: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa', icon: ArrowDownUp, financialOnly: true },
      { label: 'Histórico', href: '/financeiro/historico', icon: History, financialOnly: true },
      { label: 'Pagar no Giro', href: '/financeiro/pagar-no-giro', icon: Banknote, financialOnly: true },
      { label: 'Assinaturas', href: '/assinaturas', icon: CreditCard },
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
      { label: 'Sócios', href: '/socios', icon: Users, financialOnly: true },
      { label: 'Beneficiários', href: '/beneficiarios', icon: UserCog },
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

export const allNavItems = navGroups.flatMap((group) => group.items);

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const canSeeFinancial = useHasAnyFinancialBoat();

  const toggle = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.financialOnly || canSeeFinancial),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-64 flex-col bg-sidebar-bg/95 backdrop-blur-md border-r border-white/5 text-sidebar-foreground transition-all duration-300">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Image src="/logo-white.png" alt="Nautify" width={36} height={36} />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">Nautify</h1>
          <p className="text-[10px] text-sidebar-muted tracking-widest uppercase">Gestão Náutica</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-thin">
        {visibleGroups.map((group) => {
          const isCollapsed = collapsed[group.section];
          const hasActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
          );

          return (
            <div key={group.section}>
              <button
                onClick={() => toggle(group.section)}
                className="flex items-center justify-between w-full px-3 mb-1 cursor-pointer group"
              >
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    hasActive ? 'text-nautify-400' : 'text-sidebar-muted group-hover:text-sidebar-foreground/70',
                  )}
                >
                  {group.section}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 text-sidebar-muted transition-transform',
                    isCollapsed && '-rotate-90',
                  )}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5 overflow-hidden animate-collapse-open">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-nautify-700/50 text-white'
                            : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-white',
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-nautify-400" />
                        )}
                        <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-nautify-400' : '')} />
                        {item.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nautify-400" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/termos"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/termos' || pathname.startsWith('/termos/')
              ? 'bg-nautify-700/50 text-white'
              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-white',
          )}
        >
          <Shield className="h-5 w-5" />
          Termos e Políticas
        </Link>
        <Link
          href="/configuracoes"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/configuracoes'
              ? 'bg-nautify-700/50 text-white'
              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-white',
          )}
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Link>
        <button onClick={() => authService.logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:bg-red-500/10 hover:text-red-400 transition-all w-full cursor-pointer">
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
