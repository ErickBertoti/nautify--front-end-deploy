'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { allNavItems } from './Sidebar';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useUser } from '@/contexts/UserContext';
import { useApi } from '@/hooks/useApi';
import { notificationService } from '@/services';
import type { Notification } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Menu,
  X,
  Bell,
  BellOff,
  Search,
  Sun,
  Moon,
  Settings,
  LogOut,
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
  ChevronDown,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { data: notifications } = useApi<Notification[]>(() => notificationService.list());

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;
  const recentNotifications = notifications?.slice(0, 5) || [];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'light');
  };

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
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (userMenuOpen || notificationsOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen, notificationsOpen]);

  const currentPage = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-card/70 backdrop-blur-lg px-4 lg:px-6 transition-colors duration-300">
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
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setUserMenuOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-xl animate-dropdown-in origin-top-right z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-nautify-100 text-nautify-700 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {unreadCount} nova{unreadCount !== 1 && 's'}
                    </span>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar">
                  {recentNotifications.length > 0 ? (
                    <div className="flex flex-col">
                      {recentNotifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href="/notificacoes"
                          onClick={() => setNotificationsOpen(false)}
                          className={cn(
                            "flex flex-col gap-1 px-4 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border/50 last:border-0",
                            !notif.isRead ? "bg-nautify-50/10" : ""
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={cn("text-sm font-medium line-clamp-1 flex-1", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                              {notif.title}
                            </span>
                            {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-nautify-500 shrink-0 mt-1.5" />}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      size="sm" 
                      icon={BellOff} 
                      title="Nenhuma notificação" 
                      description="Você está em dia com tudo!" 
                    />
                  )}
                </div>

                <div className="border-t border-border p-2 bg-muted/30">
                  <Link
                    href="/notificacoes"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex text-xs text-center w-full justify-center py-2 text-nautify-600 hover:text-nautify-700 hover:bg-nautify-50 dark:hover:bg-nautify-950/30 rounded-md transition-colors font-semibold uppercase tracking-wider"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen((v) => !v);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-nautify-100 flex items-center justify-center">
                <User className="h-4 w-4 text-nautify-700" />
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0] || '...'}</span>
              <ChevronDown className={cn('hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', userMenuOpen && 'rotate-180')} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-xl animate-dropdown-in origin-top-right z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name || '...'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || '...'}</p>
                </div>
                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Configurações
                  </Link>
                </div>
                <div className="border-t border-border py-1.5">
                  <Link
                    href="/login"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Link>
                </div>
              </div>
            )}
          </div>
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
                <Image
                  src="/logo-white.png"
                  alt="Nautify"
                  width={36}
                  height={36}
                />
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
