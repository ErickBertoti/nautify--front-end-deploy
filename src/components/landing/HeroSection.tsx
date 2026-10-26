'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0f172a]" />

      {/* Gradient blobs */}
      <div className="absolute top-1/4 -left-24 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-landing-blob" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-landing-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] animate-landing-blob animation-delay-4000" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
        <motion.div
          className="text-center lg:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
            Gestão náutica sem complicação
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-7">
            A Evolução na Gestão da{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
              Sua Embarcação
            </span>
          </h1>

        <motion.p
          className="max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-slate-400 mb-9 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Controle financeiro, agenda compartilhada, manutenções e documentos
          — tudo em uma plataforma inteligente feita para quem vive o mar.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-400 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Começar grátis · 10 dias
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-slate-300 transition-all duration-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 backdrop-blur-sm"
          >
            <Play className="size-4 fill-current" aria-hidden="true" />
            Conhecer funcionalidades
          </a>
        </motion.div>

        <motion.p
          className="mt-6 text-sm text-slate-500 text-center lg:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          Sem cartão de crédito · Cancele quando quiser
        </motion.p>

        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-xl lg:mx-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Visão geral</p>
                  <p className="mt-1 text-lg font-semibold text-white">Sua frota em movimento</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">+18,4%</span>
              </div>
              <div className="flex items-end gap-2 rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-400/5 p-5">
                <p className="text-4xl font-bold tracking-tight text-white">R$ 24.680</p>
                <span className="mb-1 text-sm text-slate-500">este mês</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['12', 'Saídas'],
                  ['08', 'Manutenções'],
                  ['04', 'Sócios'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <Check className="size-4 text-emerald-300" aria-hidden="true" />
                Tudo organizado para a próxima saída
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-2 grid grid-cols-3 gap-8 max-w-lg mx-auto lg:col-span-2 lg:justify-self-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {[
            { value: '500+', label: 'Embarcações' },
            { value: '2.5k', label: 'Usuários' },
            { value: '12k+', label: 'Avaliações' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
        </div>
      </div>
    </section>
  );
}
