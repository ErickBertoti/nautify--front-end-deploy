'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-white.png"
              alt="Nautify Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-white tracking-tight">
              Nautify
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Planos
            </a>
            <a
              href="#faq"
              className="hidden md:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-blue-500"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
