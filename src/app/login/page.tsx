'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Integrar com API Go
    setTimeout(() => {
      localStorage.setItem('nautify_token', 'mock-token');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-nautify-950 via-nautify-900 to-nautify-800 relative overflow-hidden">
        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 800">
            <defs>
              <pattern id="waves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q50 50 100 100 T200 100" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0 150 Q50 100 100 150 T200 150" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#waves)" />
          </svg>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/5 animate-fade-in" style={{ animationDelay: '600ms' }} />
        <div className="absolute bottom-32 right-32 w-20 h-20 rounded-full bg-nautify-400/10 animate-fade-in" style={{ animationDelay: '800ms' }} />

        <div className="relative z-10 flex flex-col justify-center px-16 animate-stagger">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo-white.png"
              alt="Nautify"
              width={56}
              height={56}
              className="drop-shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Nautify</h1>
              <p className="text-sm text-nautify-300">Gestão de Sociedades Náuticas</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Gerencie sua
            <br />
            embarcação com
            <br />
            <span className="text-nautify-400">transparência total</span>
          </h2>
          <p className="text-lg text-nautify-200/80 max-w-md">
            Rateio automático, controle de despesas, registro de saídas e muito mais.
            Tudo em uma plataforma profissional.
          </p>
          <div className="flex gap-8 mt-12">
            <div className="group">
              <p className="text-2xl font-bold text-white group-hover:text-nautify-400 transition-colors">100%</p>
              <p className="text-sm text-nautify-300">Transparência</p>
            </div>
            <div className="group">
              <p className="text-2xl font-bold text-white group-hover:text-nautify-400 transition-colors">Auto</p>
              <p className="text-sm text-nautify-300">Rateio</p>
            </div>
            <div className="group">
              <p className="text-2xl font-bold text-white group-hover:text-nautify-400 transition-colors">24/7</p>
              <p className="text-sm text-nautify-300">Disponível</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden animate-fade-up">
            <Image
              src="/logo-blue.png"
              alt="Nautify"
              width={40}
              height={40}
            />
            <h1 className="text-2xl font-bold text-foreground">Nautify</h1>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10 hidden sm:flex">
                <Anchor className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
            </div>
            <p className="text-muted-foreground mt-1 mb-8">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-stagger">
            <div className="relative">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 pr-10"
                required
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer group">
                <input type="checkbox" className="rounded border-input accent-primary" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Lembrar de mim</span>
              </label>
              <Link href="/esqueci-senha" className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
