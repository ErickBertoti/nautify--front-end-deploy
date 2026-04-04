'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, Anchor, Navigation, Shield, Clock, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { authService } from '@/services';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dismissUrlMessages, setDismissUrlMessages] = useState(false);

  const urlError = searchParams.get('error') === 'auth-callback'
    ? 'O link de acesso expirou ou e invalido.'
    : '';
  const urlInfoMessage = searchParams.get('message') === 'password-reset-success'
    ? 'Senha alterada com sucesso. Entre com sua nova senha.'
    : '';
  const displayError = error || (!dismissUrlMessages ? urlError : '');
  const displayInfoMessage = !dismissUrlMessages ? urlInfoMessage : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDismissUrlMessages(true);

    try {
      const supabase = createClient();
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (sbError || !data.session) {
        setError(sbError?.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : sbError?.message || 'Erro ao fazer login');
        setIsLoading(false);
        return;
      }

      // Verifica se há registro pendente (cadastro antes da verificação de email)
      const pendingReg = localStorage.getItem('nautify_pending_registration');
      let res;
      if (pendingReg) {
        try {
          const regData = JSON.parse(pendingReg);
          res = await authService.supabaseRegister(data.session.access_token, regData);
          localStorage.removeItem('nautify_pending_registration');
        } catch {
          // Se falhar (ex: usuário já existe), tenta login normal
          res = await authService.supabaseLogin(data.session.access_token);
          localStorage.removeItem('nautify_pending_registration');
        }
      } else {
        res = await authService.supabaseLogin(data.session.access_token);
      }
      localStorage.setItem('nautify_token', res.data.token);

      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect || '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0c1322' }}>
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0c1322 0%, #141b2b 40%, #0c1322 100%)' }} />

        {/* Compass rose SVG */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <svg viewBox="0 0 400 400" className="w-[600px] h-[600px]" style={{ transform: 'rotate(-15deg)' }}>
            <circle cx="200" cy="200" r="180" fill="none" stroke="#b9c6eb" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="#b9c6eb" strokeWidth="0.3" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="#b9c6eb" strokeWidth="0.5" />
            {/* Cardinal points */}
            <polygon points="200,20 210,180 200,160 190,180" fill="#b9c6eb" opacity="0.8" />
            <polygon points="200,380 210,220 200,240 190,220" fill="#b9c6eb" opacity="0.4" />
            <polygon points="20,200 180,190 160,200 180,210" fill="#b9c6eb" opacity="0.4" />
            <polygon points="380,200 220,190 240,200 220,210" fill="#b9c6eb" opacity="0.4" />
            {/* Intercardinal points */}
            <polygon points="72,72 185,175 170,170 175,185" fill="#eec068" opacity="0.3" />
            <polygon points="328,72 225,175 230,170 215,185" fill="#eec068" opacity="0.3" />
            <polygon points="72,328 175,225 170,230 185,215" fill="#eec068" opacity="0.3" />
            <polygon points="328,328 225,225 215,230 230,215" fill="#eec068" opacity="0.3" />
            {/* Degree marks */}
            {[...Array(36)].map((_, i) => {
              const angle = (i * 10 * Math.PI) / 180;
              const x1 = Math.round((200 + 170 * Math.cos(angle)) * 100) / 100;
              const y1 = Math.round((200 + 170 * Math.sin(angle)) * 100) / 100;
              const x2 = Math.round((200 + 180 * Math.cos(angle)) * 100) / 100;
              const y2 = Math.round((200 + 180 * Math.sin(angle)) * 100) / 100;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b9c6eb" strokeWidth={i % 9 === 0 ? '1' : '0.3'} />;
            })}
          </svg>
        </div>

        {/* Ambient glow effects */}
        <div
          className="absolute animate-landing-blob"
          style={{
            top: '15%', right: '10%', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(185,198,235,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute animate-landing-blob animation-delay-2000"
          style={{
            bottom: '20%', left: '15%', width: '400px', height: '400px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,192,104,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between py-12 px-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-up">
            <Image
              src="/logo-white.png"
              alt="Nautify"
              width={48}
              height={48}
              className="drop-shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#dce2f7', fontFamily: 'var(--font-heading)' }}>
                Nautify
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#eec068' }}>
                Gestao Nautica
              </p>
            </div>
          </div>

          {/* Headline - Editorial scale */}
          <div className="max-w-lg animate-fade-up" style={{ animationDelay: '100ms' }}>
            <p className="text-xs uppercase tracking-[0.25em] mb-6 font-medium" style={{ color: '#8f9097', fontFamily: 'var(--font-sans)' }}>
              Plataforma de Gestao
            </p>
            <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] mb-6" style={{ color: '#dce2f7', fontFamily: 'var(--font-heading)' }}>
              Navegue com{' '}
              <span style={{ color: '#eec068', fontStyle: 'italic' }}>tranquilidade</span>
              {' '}e seguranca
            </h2>
            <p className="text-base leading-relaxed max-w-md" style={{ color: '#8f9097', fontFamily: 'var(--font-sans)' }}>
              Rateio automatico, controle de despesas, registro de saidas e muito mais.
              Tudo em uma plataforma profissional.
            </p>
          </div>

          {/* Stat cards - Glass telemetry style */}
          <div className="flex gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {[
              { icon: Shield, value: '100%', label: 'TRANSPARENCIA' },
              { icon: Navigation, value: 'Auto', label: 'RATEIO' },
              { icon: Clock, value: '24/7', label: 'DISPONIVEL' },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300 cursor-default"
                style={{
                  background: 'rgba(46,53,69,0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(69,71,76,0.15)',
                }}
              >
                <div
                  className="p-2 rounded-lg transition-colors duration-300"
                  style={{ background: 'rgba(238,192,104,0.08)' }}
                >
                  <Icon className="h-4 w-4 transition-colors duration-300" style={{ color: '#eec068' }} />
                </div>
                <div>
                  <p
                    className="text-lg font-bold transition-colors duration-300"
                    style={{ color: '#dce2f7', fontFamily: 'var(--font-heading)' }}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] tracking-[0.15em]" style={{ color: '#8f9097', fontFamily: 'var(--font-sans)' }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div
        className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8 relative"
        style={{ background: '#141b2b' }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(185,198,235,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(185,198,235,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden animate-fade-up">
            <Image
              src="/logo-blue.png"
              alt="Nautify"
              width={36}
              height={36}
            />
            <h1 className="text-xl font-bold" style={{ color: '#dce2f7', fontFamily: 'var(--font-heading)' }}>Nautify</h1>
          </div>

          {/* Glass card */}
          <div
            className="rounded-2xl p-8 sm:p-10 animate-fade-up"
            style={{
              background: 'linear-gradient(135deg, rgba(25,31,47,0.9) 0%, rgba(25,31,47,0.6) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(69,71,76,0.15)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header */}
            <div className="mb-8 animate-fade-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(238,192,104,0.08)',
                    border: '1px solid rgba(238,192,104,0.12)',
                  }}
                >
                  <Anchor className="h-5 w-5" style={{ color: '#eec068' }} strokeWidth={2.5} />
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold tracking-tight"
                  style={{ color: '#dce2f7', fontFamily: 'var(--font-heading)' }}
                >
                  Bem-vindo de volta
                </h2>
              </div>
              <p className="text-sm mt-1" style={{ color: '#8f9097' }}>
                Entre com suas credenciais para acessar sua frota.
              </p>
            </div>

            {/* Form - Instrument Panel style */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-stagger">
              {/* Email field */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-3 font-medium" style={{ color: '#c5c6cd', fontFamily: 'var(--font-sans)' }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200" style={{ color: focusedField === 'email' ? '#eec068' : '#8f9097' }} />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setDismissUrlMessages(true);
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full bg-transparent pl-7 pr-3 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      color: '#dce2f7',
                      borderBottom: `1.5px solid ${focusedField === 'email' ? '#eec068' : 'rgba(69,71,76,0.3)'}`,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  {focusedField === 'email' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] animate-scale-in"
                      style={{
                        background: 'linear-gradient(90deg, #eec068, transparent)',
                        transformOrigin: 'left',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-3 font-medium" style={{ color: '#c5c6cd', fontFamily: 'var(--font-sans)' }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200" style={{ color: focusedField === 'password' ? '#eec068' : '#8f9097' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setDismissUrlMessages(true);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full bg-transparent pl-7 pr-10 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      color: '#dce2f7',
                      borderBottom: `1.5px solid ${focusedField === 'password' ? '#eec068' : 'rgba(69,71,76,0.3)'}`,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors duration-200"
                    style={{ color: '#8f9097' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#dce2f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8f9097')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {focusedField === 'password' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] animate-scale-in"
                      style={{
                        background: 'linear-gradient(90deg, #eec068, transparent)',
                        transformOrigin: 'left',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div
                      className="w-4 h-4 rounded border transition-all duration-200 peer-checked:border-[#eec068] peer-checked:bg-[#eec068]/20"
                      style={{ borderColor: 'rgba(69,71,76,0.4)' }}
                    />
                    <svg className="absolute inset-0 w-4 h-4 text-[#eec068] opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 16 16">
                      <path d="M4 8l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm transition-colors duration-200" style={{ color: '#8f9097' }}>
                    Lembrar de mim
                  </span>
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: '#eec068' }}
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Error message */}
              {displayError && (
                <p className="text-sm text-red-400 text-center">{displayError}</p>
              )}

              {displayInfoMessage && (
                <p className="text-sm text-emerald-400 text-center">{displayInfoMessage}</p>
              )}

              {/* Submit button - Gold gradient */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #60b8fa)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.05em',
                }}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign-up link */}
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
              <p className="text-sm" style={{ color: '#8f9097' }}>
                Nao tem uma conta?{' '}
                <Link
                  href="/register"
                  className="font-medium transition-all duration-200 hover:opacity-80"
                  style={{ color: '#eec068' }}
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
