'use client';

import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#0b1120]">
      {/* Radial blue glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para desamarrar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              as cordas?
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Simplifique a gestão da sua embarcação e navegue com tranquilidade.
            Acesse a plataforma e descubra uma nova forma de cuidar do que é seu.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-500 hover:to-blue-400 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Acessar Plataforma Agora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
