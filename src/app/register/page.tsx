'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    // TODO: Integrar com API Go
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-nautify-950 via-nautify-900 to-nautify-800 relative overflow-hidden">
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
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo-white.png"
              alt="Nautify"
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Nautify</h1>
              <p className="text-sm text-nautify-300">Gestão de Sociedades Náuticas</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Comece a gerenciar
            <br />
            sua embarcação
            <br />
            <span className="text-nautify-400">de forma profissional</span>
          </h2>
          <p className="text-lg text-nautify-200/80 max-w-md">
            Crie sua conta gratuita e adicione sua primeira embarcação em minutos.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image
              src="/logo-blue.png"
              alt="Nautify"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <h1 className="text-2xl font-bold text-foreground">Nautify</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Criar conta</h2>
            <p className="text-muted-foreground mt-1">Preencha seus dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pl-10"
                required
              />
              <User className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            </div>

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
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="pl-10"
              />
              <Phone className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 pr-10"
                required
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="pl-10"
                required
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Criar conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
