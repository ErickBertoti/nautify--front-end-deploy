'use client';

import { motion } from 'framer-motion';

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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8">
            A Evolução na Gestão da{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
              Sua Embarcação
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Controle financeiro, agenda compartilhada, manutenções e documentos
          — tudo em uma plataforma inteligente feita para quem vive o mar.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-500 hover:to-blue-400 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Começar grátis · 10 dias
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 transition-all duration-200 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white hover:border-white/20 backdrop-blur-sm"
          >
            Conhecer funcionalidades
          </a>
        </motion.div>

        <motion.p
          className="mt-6 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          Sem cartão de crédito · Cancele quando quiser
        </motion.p>

        {/* Stats bar */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
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
    </section>
  );
}
