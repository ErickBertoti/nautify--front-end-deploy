'use client';

import { motion } from 'framer-motion';

const audiences = [
  {
    title: 'Proprietários Individuais',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    benefits: [
      'Acompanhe custos mensais',
      'Histórico de manutenção',
      'Proteja o valor de revenda',
    ],
    popular: false,
  },
  {
    title: 'Múltiplos Sócios',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    benefits: [
      'Agenda justa para todos',
      'Rateio automático de despesas',
      'Transparência financeira total',
    ],
    popular: true,
  },
  {
    title: 'Locação & Frotas',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
    benefits: [
      'Painel de controle completo',
      'Gestão de tripulação',
      'Checklists operacionais',
      'Acompanhamento de margem de lucro',
    ],
    popular: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function AudienceSection() {
  return (
    <section className="relative py-28 bg-[#0f172a] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            Feito para quem vive o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              mar
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Não importa se você navega sozinho ou gerencia uma frota — o Nautify
            se adapta à sua realidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {audiences.map((audience, i) => (
            <motion.div
              key={audience.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                audience.popular
                  ? 'bg-gradient-to-b from-blue-900/30 to-slate-900/60 border-blue-500/30 shadow-xl shadow-blue-900/20 lg:-translate-y-4'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/80'
              }`}
            >
              {audience.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30">
                    Mais Popular
                  </span>
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  audience.popular
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-slate-700/50 text-slate-300'
                }`}
              >
                {audience.icon}
              </div>

              <h3 className={`text-2xl font-bold mb-6 ${audience.popular ? 'text-white' : 'text-blue-400'}`}>
                {audience.title}
              </h3>

              <ul className="space-y-4">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
